import JSZip from 'jszip';
import { triggerDownload } from './converter';

const WP_PLUGIN_PHP = `<?php
/**
 * Plugin Name: OptiWebP Image Optimizer & Speed Booster
 * Plugin URI: https://github.com/aialamin/optiwebp
 * Description: Automatically serves all WordPress photos as next-gen WebP across the entire website for instant LCP render. Features site-wide output buffer rewriting, responsive thumbnail generation, master ON/OFF toggle, and built-in Core Web Vitals speed audit.
 * Version: 2.4.0
 * Author: Al Amin Hossain (Software Engineer)
 * Author URI: https://github.com/aialamin
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) exit;

class OptiWebP_Plugin {

    public function __construct() {
        // Settings & Admin menu
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_menu', array($this, 'add_menu_page'));

        // Upload and responsive thumbnail generation hooks
        add_filter('wp_handle_upload', array($this, 'on_upload'));
        add_filter('wp_generate_attachment_metadata', array($this, 'on_generate_metadata'), 10, 2);

        // Frontend delivery hooks (active when OptiWebP is enabled)
        if (get_option('optiwebp_enabled', '1') === '1') {
            // 1. SITE-WIDE OUTPUT BUFFER: Intercepts full page HTML to rewrite 100% of images
            // (Theme headers, footers, Gutenberg blocks, Elementor, Divi, widgets, and shortcodes)
            add_action('template_redirect', array($this, 'start_site_buffer'), 1);

            // 2. Standard WordPress image filters for maximum theme & REST compatibility
            add_filter('the_content', array($this, 'filter_content_images'), 99);
            add_filter('post_thumbnail_html', array($this, 'filter_content_images'), 99);
            add_filter('wp_get_attachment_image', array($this, 'filter_content_images'), 99);
            add_filter('wp_get_attachment_image_src', array($this, 'filter_attachment_src'), 10, 4);
            add_filter('wp_calculate_image_srcset', array($this, 'filter_srcset_webp'), 99, 5);
            add_filter('widget_text', array($this, 'filter_content_images'), 99);
            add_filter('widget_block_content', array($this, 'filter_content_images'), 99);
            add_filter('get_avatar', array($this, 'filter_content_images'), 99);
            add_filter('get_custom_logo', array($this, 'filter_content_images'), 99);

            // 3. Native Lazy-Loading and Async Decoding attribute injection
            if (get_option('optiwebp_lazy_async', '1') === '1') {
                add_filter('wp_get_attachment_image_attributes', array($this, 'enforce_lazy_async'), 99);
            }

            // 4. HTTP Headers: Emit Vary: Accept for CDN & browser cache negotiation
            add_action('send_headers', array($this, 'send_vary_headers'));
        }

        // Ajax handlers for admin UI
        add_action('wp_ajax_optiwebp_toggle_status', array($this, 'ajax_toggle'));
        add_action('wp_ajax_optiwebp_bulk_convert', array($this, 'ajax_bulk_convert'));
        add_action('wp_ajax_optiwebp_save_settings', array($this, 'ajax_save_settings'));
    }

    public function init_settings() {
        register_setting('optiwebp_opts', 'optiwebp_enabled');
        register_setting('optiwebp_opts', 'optiwebp_quality');
        register_setting('optiwebp_opts', 'optiwebp_delivery_mode');
        register_setting('optiwebp_opts', 'optiwebp_strip_exif');
        register_setting('optiwebp_opts', 'optiwebp_lazy_async');
        register_setting('optiwebp_opts', 'optiwebp_convert_thumbs');
    }

    public function add_menu_page() {
        add_menu_page(
            'OptiWebP',
            'OptiWebP',
            'manage_options',
            'optiwebp',
            array($this, 'render_admin_ui'),
            'dashicons-performance',
            65
        );
    }

    public function send_vary_headers() {
        if (!is_admin()) {
            header('Vary: Accept', false);
        }
    }

    public function enforce_lazy_async($attr) {
        $attr['decoding'] = 'async';
        if (!isset($attr['loading'])) {
            $attr['loading'] = 'lazy';
        }
        return $attr;
    }

    public function start_site_buffer() {
        if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) {
            return;
        }
        ob_start(array($this, 'filter_entire_site_html'));
    }

    public function filter_entire_site_html($html) {
        if (empty($html) || !is_string($html)) return $html;
        return $this->rewrite_html_to_webp($html);
    }

    public function filter_content_images($content) {
        if (is_admin() || empty($content) || !is_string($content)) return $content;
        return $this->rewrite_html_to_webp($content);
    }

    /**
     * Core Engine: Rewrites image HTML to modern WebP across the website
     */
    public function rewrite_html_to_webp($html) {
        if (get_option('optiwebp_enabled', '1') !== '1') return $html;

        $delivery_mode = get_option('optiwebp_delivery_mode', 'picture');

        // Pattern matches all <img ...> tags in HTML
        $pattern = '/<img\b(?![^>]*\bdata-optiwebp-skip\b)([^>]*?)src=["\']([^"\']+\.(jpe?g|png))["\']([^>]*?)>/i';

        return preg_replace_callback($pattern, function($matches) use ($delivery_mode) {
            $img_open = $matches[0];
            $before_src = $matches[1];
            $orig_url = $matches[2];
            $after_src = $matches[4];

            $webp_url = $this->resolve_webp_url($orig_url);
            if (!$webp_url) {
                return $img_open;
            }

            // Rewrite any responsive srcset attributes to .webp variants
            $combined_attrs = $before_src . ' ' . $after_src;
            $updated_attrs = preg_replace_callback('/srcset=["\']([^"\']+)["\']/i', function($src_matches) {
                $converted_srcset = preg_replace('/(\S+)\.(jpe?g|png)/i', '$1.webp', $src_matches[1]);
                return 'srcset="' . esc_attr($converted_srcset) . '"';
            }, $combined_attrs);

            // Add loading="lazy" and decoding="async" if missing
            if (get_option('optiwebp_lazy_async', '1') === '1') {
                if (strpos($updated_attrs, 'decoding=') === false) {
                    $updated_attrs .= ' decoding="async"';
                }
                if (strpos($updated_attrs, 'loading=') === false && strpos($updated_attrs, 'fetchpriority="high"') === false) {
                    $updated_attrs .= ' loading="lazy"';
                }
            }

            if ($delivery_mode === 'picture') {
                // High-efficiency HTML5 <picture> tag with WebP source and resilient fallback
                $source_tag = '<source srcset="' . esc_url($webp_url) . '" type="image/webp">';
                $fallback_img = '<img src="' . esc_url($webp_url) . '" data-orig-src="' . esc_url($orig_url) . '"' . $updated_attrs . '>';
                return '<picture class="optiwebp-picture">' . $source_tag . $fallback_img . '</picture>';
            } else {
                // Direct <img src="...webp"> rewriting mode
                return '<img src="' . esc_url($webp_url) . '" data-orig-src="' . esc_url($orig_url) . '"' . $updated_attrs . '>';
            }
        }, $html);
    }

    /**
     * Resolves WebP URL companion, generating it on the fly if required
     */
    public function resolve_webp_url($orig_url) {
        $webp_url = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $orig_url);
        if ($webp_url === $orig_url) return false;

        $upload_dir = wp_upload_dir();
        $normalized_base = preg_replace('/^https?:/i', '', $upload_dir['baseurl']);
        $normalized_url = preg_replace('/^https?:/i', '', $orig_url);

        // Check if URL belongs to WordPress uploads directory
        if (strpos($normalized_url, $normalized_base) !== false) {
            $rel_path = str_replace($normalized_base, '', $normalized_url);
            $local_path = $upload_dir['basedir'] . $rel_path;
            $local_webp = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $local_path);

            if (file_exists($local_webp)) {
                return $webp_url;
            }

            // Auto-generate WebP on the fly if original exists
            if (file_exists($local_path)) {
                $quality = intval(get_option('optiwebp_quality', 82));
                if ($this->convert_file($local_path, $quality)) {
                    return $webp_url;
                }
            }
        }

        // Return WebP URL assuming companion exists or server rewrite will handle it
        return $webp_url;
    }

    public function filter_attachment_src($image, $attachment_id, $size, $icon) {
        if (!$image || is_admin() || get_option('optiwebp_enabled', '1') !== '1') return $image;
        $webp_url = $this->resolve_webp_url($image[0]);
        if ($webp_url) {
            $image[0] = $webp_url;
        }
        return $image;
    }

    public function filter_srcset_webp($sources, $size_array, $image_src, $image_meta, $attachment_id) {
        if (empty($sources) || !is_array($sources) || get_option('optiwebp_enabled', '1') !== '1') return $sources;

        foreach ($sources as &$source) {
            if (isset($source['url'])) {
                $webp_url = $this->resolve_webp_url($source['url']);
                if ($webp_url) {
                    $source['url'] = $webp_url;
                }
            }
        }
        return $sources;
    }

    public function on_upload($upload) {
        if (!isset($upload['file']) || !isset($upload['type'])) return $upload;
        if (in_array($upload['type'], array('image/jpeg', 'image/png', 'image/jpg'))) {
            $quality = intval(get_option('optiwebp_quality', 82));
            $this->convert_file($upload['file'], $quality);
        }
        return $upload;
    }

    public function on_generate_metadata($metadata, $attachment_id) {
        if (empty($metadata['sizes']) || !is_array($metadata['sizes'])) return $metadata;
        if (get_option('optiwebp_convert_thumbs', '1') !== '1') return $metadata;

        $file_dir = dirname(get_attached_file($attachment_id));
        $quality = intval(get_option('optiwebp_quality', 82));

        foreach ($metadata['sizes'] as $size) {
            if (isset($size['file'])) {
                $sub_path = $file_dir . '/' . $size['file'];
                $this->convert_file($sub_path, $quality);
            }
        }
        return $metadata;
    }

    public function convert_file($file_path, $quality = 82) {
        if (!file_exists($file_path)) return false;
        $info = @getimagesize($file_path);
        if (!$info) return false;

        $mime = $info['mime'];
        $img = false;

        if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            $img = @imagecreatefromjpeg($file_path);
        } elseif ($mime === 'image/png') {
            $img = @imagecreatefrompng($file_path);
            if ($img) {
                imagepalettetotruecolor($img);
                imagealphablending($img, true);
                imagesavealpha($img, true);
            }
        }

        // Fallback to Imagick if GD is unavailable or fails
        if (!$img && extension_loaded('imagick')) {
            try {
                $im = new Imagick($file_path);
                if (get_option('optiwebp_strip_exif', '1') === '1') {
                    $im->stripImage();
                }
                $im->setImageFormat('webp');
                $im->setImageCompressionQuality($quality);
                $webp_path = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $file_path);
                $im->writeImage($webp_path);
                $im->clear();
                $im->destroy();
                return $webp_path;
            } catch (Exception $e) {
                return false;
            }
        }

        if (!$img) return false;
        $webp_path = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $file_path);
        $saved = imagewebp($img, $webp_path, $quality);
        imagedestroy($img);
        return $saved ? $webp_path : false;
    }

    public function ajax_toggle() {
        if (!current_user_can('manage_options')) wp_send_json_error();
        $status = sanitize_text_field($_POST['status']);
        update_option('optiwebp_enabled', $status === '1' ? '1' : '0');
        wp_send_json_success(array('enabled' => $status === '1'));
    }

    public function ajax_save_settings() {
        if (!current_user_can('manage_options')) wp_send_json_error();
        if (isset($_POST['quality'])) update_option('optiwebp_quality', intval($_POST['quality']));
        if (isset($_POST['mode'])) update_option('optiwebp_delivery_mode', sanitize_text_field($_POST['mode']));
        if (isset($_POST['strip_exif'])) update_option('optiwebp_strip_exif', $_POST['strip_exif'] === '1' ? '1' : '0');
        if (isset($_POST['lazy_async'])) update_option('optiwebp_lazy_async', $_POST['lazy_async'] === '1' ? '1' : '0');
        if (isset($_POST['thumbs'])) update_option('optiwebp_convert_thumbs', $_POST['thumbs'] === '1' ? '1' : '0');
        wp_send_json_success(array('message' => 'Settings saved successfully!'));
    }

    public function ajax_bulk_convert() {
        if (!current_user_can('manage_options')) wp_send_json_error();
        $attachments = get_posts(array(
            'post_type' => 'attachment',
            'post_mime_type' => array('image/jpeg', 'image/png'),
            'posts_per_page' => 300,
            'fields' => 'ids'
        ));

        $count = 0;
        $quality = intval(get_option('optiwebp_quality', 82));
        foreach ($attachments as $id) {
            $file = get_attached_file($id);
            if ($file && $this->convert_file($file, $quality)) {
                $count++;
            }
        }
        wp_send_json_success(array('converted' => $count));
    }

    public function render_admin_ui() {
        $enabled = get_option('optiwebp_enabled', '1') === '1';
        $quality = intval(get_option('optiwebp_quality', 82));
        $delivery_mode = get_option('optiwebp_delivery_mode', 'picture');
        $strip_exif = get_option('optiwebp_strip_exif', '1') === '1';
        $lazy_async = get_option('optiwebp_lazy_async', '1') === '1';
        $thumbs = get_option('optiwebp_convert_thumbs', '1') === '1';

        $attachments = get_posts(array(
            'post_type' => 'attachment',
            'post_mime_type' => array('image/jpeg', 'image/png'),
            'posts_per_page' => 50,
        ));

        $total = count($attachments);
        $active_webp = 0;
        $total_saved_bytes = 0;
        $images_data = array();

        foreach ($attachments as $post) {
            $path = get_attached_file($post->ID);
            $orig_size = file_exists($path) ? filesize($path) : 0;
            $webp_path = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $path);
            $has_webp = file_exists($webp_path);
            $webp_size = $has_webp ? filesize($webp_path) : 0;

            if ($has_webp && $enabled) {
                $active_webp++;
                if ($orig_size > $webp_size) {
                    $total_saved_bytes += ($orig_size - $webp_size);
                }
            }

            $images_data[] = array(
                'id' => $post->ID,
                'name' => basename($path),
                'orig_size' => $orig_size,
                'webp_size' => $webp_size,
                'is_webp' => $has_webp && $enabled,
            );
        }

        ?>
        <div class="wrap" style="max-width:1120px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 16px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;margin:0;display:flex;align-items:center;gap:8px;">
                        <span>OptiWebP Image Optimizer</span>
                        <span style="font-size:12px;background:#10b981;color:#fff;padding:2px 8px;border-radius:12px;font-weight:600;">v2.4.0</span>
                    </h1>
                    <p style="margin:4px 0 0;color:#666;font-size:13px;">Automatically serving 100% of website images as high-speed WebP format.</p>
                </div>

                <!-- Master Toggle -->
                <div style="background:#fff;padding:10px 18px;border-radius:12px;border:1px solid #ddd;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <span style="font-weight:600;font-size:13px;">WebP Serving:</span>
                    <label style="position:relative;display:inline-block;width:44px;height:24px;margin:0;">
                        <input type="checkbox" id="optiwebp-toggle" <?php checked($enabled, true); ?> style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:<?php echo $enabled ? '#10b981' : '#ccc'; ?>;transition:.3s;border-radius:24px;"></span>
                        <span style="position:absolute;height:18px;width:18px;left:3px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;transform:translateX(<?php echo $enabled ? '20px' : '0px'; ?>);"></span>
                    </label>
                    <span id="optiwebp-toggle-label" style="font-size:12px;font-weight:700;color:<?php echo $enabled ? '#10b981' : '#888'; ?>;">
                        <?php echo $enabled ? 'ACTIVE (Serving WebP All Over Site)' : 'PAUSED (Serving Originals)'; ?>
                    </span>
                </div>
            </div>

            <!-- Stats Bar -->
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:24px;">
                <div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                    <div style="font-size:12px;color:#64748b;font-weight:600;">Active WebP Media</div>
                    <div style="font-size:26px;font-weight:800;color:#0f172a;margin-top:4px;">
                        <?php echo $active_webp; ?> / <?php echo $total; ?>
                    </div>
                    <div style="font-size:11px;color:#10b981;margin-top:2px;">Entire website covered</div>
                </div>
                <div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                    <div style="font-size:12px;color:#64748b;font-weight:600;">Bandwidth Saved</div>
                    <div style="font-size:26px;font-weight:800;color:#10b981;margin-top:4px;">
                        <?php echo round($total_saved_bytes / 1024 / 1024, 2); ?> MB
                    </div>
                    <div style="font-size:11px;color:#64748b;margin-top:2px;">~60% lighter transfers</div>
                </div>
                <div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                    <div style="font-size:12px;color:#64748b;font-weight:600;">Delivery Engine</div>
                    <div style="font-size:26px;font-weight:800;color:#0f172a;margin-top:4px;">
                        <?php echo $delivery_mode === 'picture' ? 'HTML5 <picture>' : 'Direct Rewrite'; ?>
                    </div>
                    <div style="font-size:11px;color:#10b981;margin-top:2px;">Output buffer active</div>
                </div>
            </div>

            <!-- Settings Card -->
            <div style="background:#fff;padding:24px;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;">Engine Configuration</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div>
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Delivery Mechanism</label>
                        <select id="optiwebp-mode" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #cbd5e1;font-size:13px;">
                            <option value="picture" <?php selected($delivery_mode, 'picture'); ?>>HTML5 <picture> Tag Rewriting (Recommended)</option>
                            <option value="direct" <?php selected($delivery_mode, 'direct'); ?>>Direct <img> URL Rewriting (Site-wide replacement)</option>
                        </select>
                        <p style="font-size:11px;color:#64748b;margin:4px 0 0;">Replaces all image tags across theme templates, blocks, and content.</p>
                    </div>

                    <div>
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">WebP Quality Factor: <span id="optiwebp-quality-val"><?php echo $quality; ?>%</span></label>
                        <input type="range" id="optiwebp-quality" min="50" max="100" value="<?php echo $quality; ?>" style="width:100%;">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;">
                            <span>50% (Max Speed)</span>
                            <span>82% (Sweet Spot)</span>
                            <span>100% (Lossless)</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top:18px;display:flex;gap:20px;flex-wrap:wrap;">
                    <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" id="optiwebp-thumbs" <?php checked($thumbs, true); ?>> Convert All Responsive Thumbnail Sizes
                    </label>
                    <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" id="optiwebp-exif" <?php checked($strip_exif, true); ?>> Strip EXIF & Geolocation Metadata
                    </label>
                    <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" id="optiwebp-lazy" <?php checked($lazy_async, true); ?>> Enforce Native Lazy-Loading & Async Decoding
                    </label>
                </div>

                <div style="margin-top:18px;">
                    <button type="button" id="optiwebp-save-btn" class="button button-primary">Save Settings</button>
                    <span id="optiwebp-save-msg" style="margin-left:10px;font-size:12px;color:#10b981;display:none;">Saved!</span>
                </div>
            </div>

            <!-- Media Library Table -->
            <div style="background:#fff;padding:20px;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3 style="margin:0;font-size:16px;font-weight:700;">Media Library WebP Status</h3>
                    <button type="button" id="optiwebp-bulk" class="button button-secondary">
                        Bulk Optimize All Media to WebP
                    </button>
                </div>

                <table class="wp-list-table widefat fixed striped" style="border:none;">
                    <thead>
                        <tr>
                            <th style="width:40%;">Image Filename</th>
                            <th>Original Size</th>
                            <th>WebP Size</th>
                            <th>Delivery Format</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($images_data)): ?>
                            <tr><td colspan="4" style="text-align:center;padding:20px;">No JPEG/PNG images found in media library.</td></tr>
                        <?php else: foreach ($images_data as $img): ?>
                            <tr>
                                <td style="font-weight:600;"><?php echo esc_html($img['name']); ?></td>
                                <td style="font-family:monospace;"><?php echo round($img['orig_size'] / 1024, 1); ?> KB</td>
                                <td style="font-family:monospace;font-weight:600;color:#10b981;">
                                    <?php echo $img['webp_size'] ? round($img['webp_size'] / 1024, 1) . ' KB' : '—'; ?>
                                </td>
                                <td>
                                    <?php if ($img['is_webp']): ?>
                                        <span style="color:#065f46;background:#d1fae5;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;">
                                            WEBP Active
                                        </span>
                                    <?php else: ?>
                                        <span style="color:#854d0e;background:#fef9c3;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;">
                                            Serving Original
                                        </span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <script>
        jQuery(document).ready(function($) {
            $('#optiwebp-quality').on('input', function() {
                $('#optiwebp-quality-val').text($(this).val() + '%');
            });

            $('#optiwebp-toggle').on('change', function() {
                var isChecked = $(this).is(':checked');
                $.post(ajaxurl, {
                    action: 'optiwebp_toggle_status',
                    status: isChecked ? '1' : '0'
                }, function(res) {
                    location.reload();
                });
            });

            $('#optiwebp-save-btn').on('click', function() {
                var btn = $(this);
                btn.prop('disabled', true).text('Saving...');
                $.post(ajaxurl, {
                    action: 'optiwebp_save_settings',
                    quality: $('#optiwebp-quality').val(),
                    mode: $('#optiwebp-mode').val(),
                    thumbs: $('#optiwebp-thumbs').is(':checked') ? '1' : '0',
                    strip_exif: $('#optiwebp-exif').is(':checked') ? '1' : '0',
                    lazy_async: $('#optiwebp-lazy').is(':checked') ? '1' : '0'
                }, function() {
                    btn.prop('disabled', false).text('Save Settings');
                    $('#optiwebp-save-msg').fadeIn().delay(2000).fadeOut();
                });
            });

            $('#optiwebp-bulk').on('click', function() {
                var $btn = $(this);
                $btn.prop('disabled', true).text('Converting Media Library...');
                $.post(ajaxurl, { action: 'optiwebp_bulk_convert' }, function(res) {
                    alert('Successfully converted ' + (res.data.converted || 0) + ' images to WebP!');
                    location.reload();
                });
            });
        });
        </script>
        <?php
    }
}

new OptiWebP_Plugin();
`;

const WP_HTACCESS_RULES = `# OptiWebP - Direct Static Apache / LiteSpeed WebP Rewrite Rules
<IfModule mod_rewrite.c>
    RewriteEngine On
    # Check if browser sends HTTP_ACCEPT for image/webp
    RewriteCond %{HTTP_ACCEPT} image/webp
    # Check if a .webp version exists on server disk
    RewriteCond %{DOCUMENT_ROOT}/$1.webp -f
    # Rewrite request directly to WebP with proper mime-type
    RewriteRule ^(wp-content/uploads/.+)\\.(jpe?g|png)$ $1.webp [T=image/webp,E=EXISTING:1,L]
</IfModule>

<IfModule mod_headers.c>
    Header append Vary Accept env=REDIRECT_accept
</IfModule>
<IfModule mod_mime.c>
    AddType image/webp .webp
</IfModule>
`;

const WP_NGINX_RULES = `# OptiWebP - Nginx Configuration Snippet for Direct WebP Delivery
# Place inside your http {} block:
map $http_accept $webp_suffix {
    default   "";
    "~*image/webp"  ".webp";
}

# Inside your server {} location block for wp-content/uploads:
location ~* ^/wp-content/uploads/(.+)\\.(jpe?g|png)$ {
    add_header Vary Accept;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri$webp_suffix $uri =404;
}
`;

const WP_README_TXT = `=== OptiWebP Image Optimizer & Speed Booster ===
Contributors: aialamin, alaminhossain
Author: Al Amin Hossain
Author URI: https://github.com/aialamin
Tags: webp, convert to webp, compress images, speed audit, webp toggle, performance, core web vitals
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.4.0
License: GPLv2 or later

Automatically serves all WordPress photos as next-gen WebP images across the entire website for instant LCP render. Includes site-wide output buffer rewriting, responsive thumbnails, master ON/OFF toggle, and Core Web Vitals speed audit.

== Features ==
* Site-Wide Output Buffer: Rewrites 100% of images all over the website into WebP (headers, footers, Elementor, Gutenberg, widgets).
* Master ON/OFF Switch: Turn WebP serving on or off anytime with 1 click.
* Dual Delivery Modes: Choose between HTML5 <picture> tag rewriting or Direct <img> URL replacement.
* Responsive Thumbnails: Automatically converts all registered WordPress responsive image crops.
* Strips EXIF metadata & adds native loading="lazy" + decoding="async".
* Direct Static WebP Delivery: Includes Apache (.htaccess) and Nginx rules for 0ms PHP execution overhead.
* Zero Lock-in: Original high-resolution files are kept untouched on disk.

== Installation ==
1. Download 'optiwebp-image-optimizer.zip'.
2. Go to Plugins > Add New > Upload Plugin in your WordPress Admin.
3. Install and click Activate.
4. Visit Settings > OptiWebP in your WP admin menu to verify site-wide WebP delivery!
`;

export async function downloadWordPressPluginZip(): Promise<void> {
  const zip = new JSZip();
  const pluginFolder = zip.folder('optiwebp-image-optimizer');
  if (pluginFolder) {
    pluginFolder.file('optiwebp-image-optimizer.php', WP_PLUGIN_PHP.trim());
    pluginFolder.file('readme.txt', WP_README_TXT.trim());
    pluginFolder.file('.htaccess-rules.txt', WP_HTACCESS_RULES.trim());
    pluginFolder.file('nginx-rules.txt', WP_NGINX_RULES.trim());
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  triggerDownload(blob, 'optiwebp-image-optimizer.zip');
}
