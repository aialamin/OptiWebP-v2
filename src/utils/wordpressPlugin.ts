import JSZip from 'jszip';
import { triggerDownload } from './converter';

const WP_PLUGIN_PHP = `<?php
/**
 * Plugin Name: OptiWebP Image Optimizer & Speed Booster
 * Plugin URI: https://github.com/aialamin/optiwebp
 * Description: Automatically serves all WordPress photos as WebP for faster page load. Features an on/off toggle, responsive image & thumbnail optimization, media delivery stats, and built-in SEO speed audit.
 * Version: 1.2.0
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

        // Upload and thumbnail generation hooks
        add_filter('wp_handle_upload', array($this, 'on_upload'));
        add_filter('wp_generate_attachment_metadata', array($this, 'on_generate_metadata'), 10, 2);

        // Frontend delivery hooks (only active if toggle is ON)
        if (get_option('optiwebp_enabled', '1') === '1') {
            add_filter('the_content', array($this, 'serve_webp_images'), 99);
            add_filter('post_thumbnail_html', array($this, 'serve_webp_images'), 99);
            add_filter('wp_get_attachment_image', array($this, 'serve_webp_images'), 99);
            add_filter('wp_get_attachment_image_src', array($this, 'serve_attachment_webp'), 10, 4);

            // Add Cache-Control & browser Vary header for next-gen format negotiation
            add_action('send_headers', function() {
                if (!is_admin()) {
                    header('Vary: Accept', false);
                }
            });
        }

        // Ajax handlers for admin UI
        add_action('wp_ajax_optiwebp_toggle_status', array($this, 'ajax_toggle'));
        add_action('wp_ajax_optiwebp_bulk_convert', array($this, 'ajax_bulk_convert'));
    }

    public function init_settings() {
        register_setting('optiwebp_opts', 'optiwebp_enabled');
        register_setting('optiwebp_opts', 'optiwebp_quality');
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

    public function on_upload($upload) {
        if (!isset($upload['file']) || !isset($upload['type'])) return $upload;
        if (in_array($upload['type'], array('image/jpeg', 'image/png', 'image/jpg'))) {
            $quality = intval(get_option('optiwebp_quality', 85));
            $this->convert_file($upload['file'], $quality);
        }
        return $upload;
    }

    public function on_generate_metadata($metadata, $attachment_id) {
        if (empty($metadata['sizes']) || !is_array($metadata['sizes'])) return $metadata;
        $upload_dir = wp_upload_dir();
        $file_dir = dirname(get_attached_file($attachment_id));
        $quality = intval(get_option('optiwebp_quality', 85));

        foreach ($metadata['sizes'] as $size) {
            if (isset($size['file'])) {
                $sub_path = $file_dir . '/' . $size['file'];
                $this->convert_file($sub_path, $quality);
            }
        }
        return $metadata;
    }

    public function convert_file($file_path, $quality = 85) {
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

    public function serve_attachment_webp($image, $attachment_id, $size, $icon) {
        if (!$image || is_admin() || get_option('optiwebp_enabled', '1') !== '1') return $image;
        $url = $image[0];
        $webp_url = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $url);

        $upload_dir = wp_upload_dir();
        $relative_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $webp_url);
        if (file_exists($relative_path)) {
            $image[0] = $webp_url;
        }
        return $image;
    }

    public function serve_webp_images($content) {
        if (is_admin() || empty($content) || get_option('optiwebp_enabled', '1') !== '1') return $content;

        // Replace <img ...> with <picture><source srcset="...webp" type="image/webp"><img ...></picture>
        return preg_replace_callback('/<img([^>]+)src=["\\']([^"\\']+\\.(jpe?g|png))["\\']([^>]*)>/i', function($matches) {
            $original = $matches[2];
            $webp_url = preg_replace('/\\.(jpe?g|png)$/i', '.webp', $original);
            $upload_dir = wp_upload_dir();
            $path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $webp_url);

            if (file_exists($path)) {
                $srcset = '';
                if (preg_replace('/srcset=["\\']([^"\\']+)["\\']/i', '', $matches[1] . $matches[4]) !== $matches[1] . $matches[4]) {
                    // Also replace .jpg/.png in srcset with .webp
                    $webp_srcset = preg_replace('/\\.(jpe?g|png)/i', '.webp', $matches[0]);
                }
                return '<picture><source srcset="' . esc_url($webp_url) . '" type="image/webp"><img' . $matches[1] . 'src="' . esc_url($original) . '"' . $matches[4] . '></picture>';
            }
            return $matches[0];
        }, $content);
    }

    public function ajax_toggle() {
        if (!current_user_can('manage_options')) wp_send_json_error();
        $status = sanitize_text_field($_POST['status']);
        update_option('optiwebp_enabled', $status === '1' ? '1' : '0');
        wp_send_json_success(array('enabled' => $status === '1'));
    }

    public function ajax_bulk_convert() {
        if (!current_user_can('manage_options')) wp_send_json_error();
        $attachments = get_posts(array(
            'post_type' => 'attachment',
            'post_mime_type' => array('image/jpeg', 'image/png'),
            'posts_per_page' => 200,
            'fields' => 'ids'
        ));

        $count = 0;
        $quality = intval(get_option('optiwebp_quality', 85));
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
        $upload_dir = wp_upload_dir();

        $attachments = get_posts(array(
            'post_type' => 'attachment',
            'post_mime_type' => array('image/jpeg', 'image/png'),
            'posts_per_page' => 40,
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
        <div class="wrap" style="max-width:1100px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;margin:0;">OptiWebP Image Optimizer</h1>
                    <p style="margin:4px 0 0;color:#666;font-size:13px;">Manage website WebP delivery, view image-by-image status & run speed audit</p>
                </div>

                <!-- WebP Master Toggle -->
                <div style="background:#fff;padding:10px 18px;border-radius:12px;border:1px solid #ddd;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <span style="font-weight:600;font-size:13px;">WebP Delivery:</span>
                    <label style="position:relative;display:inline-block;width:44px;height:24px;margin:0;">
                        <input type="checkbox" id="optiwebp-toggle" <?php checked($enabled, true); ?> style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:<?php echo $enabled ? '#10b981' : '#ccc'; ?>;transition:.3s;border-radius:24px;"></span>
                        <span style="position:absolute;height:18px;width:18px;left:3px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;transform:translateX(<?php echo $enabled ? '20px' : '0px'; ?>);"></span>
                    </label>
                    <span id="optiwebp-toggle-label" style="font-size:12px;font-weight:600;color:<?php echo $enabled ? '#10b981' : '#888'; ?>;">
                        <?php echo $enabled ? 'ACTIVE (Serving WebP)' : 'OFF (Serving Originals)'; ?>
                    </span>
                </div>
            </div>

            <!-- Stats Bar -->
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:15px;margin-bottom:20px;">
                <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#64748b;">Images Serving as WebP</div>
                    <div style="font-size:24px;font-weight:700;color:#0f172a;margin-top:4px;">
                        <?php echo $active_webp; ?> / <?php echo $total; ?>
                    </div>
                </div>
                <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#64748b;">Total Bandwidth Saved</div>
                    <div style="font-size:24px;font-weight:700;color:#10b981;margin-top:4px;">
                        <?php echo round($total_saved_bytes / 1024 / 1024, 2); ?> MB
                    </div>
                </div>
                <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e2e8f0;">
                    <div style="font-size:12px;color:#64748b;">Delivery Status</div>
                    <div style="font-size:24px;font-weight:700;color:#0f172a;margin-top:4px;">
                        <?php echo $enabled ? 'Active' : 'Paused'; ?>
                    </div>
                </div>
            </div>

            <!-- Image-by-Image Statistics Table -->
            <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:25px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3 style="margin:0;font-size:16px;">Media Library WebP Status</h3>
                    <button type="button" id="optiwebp-bulk" class="button button-primary">
                        Bulk Optimize All Images to WebP
                    </button>
                </div>

                <table class="wp-list-table widefat fixed striped" style="border:none;">
                    <thead>
                        <tr>
                            <th style="width:40%;">Image Filename</th>
                            <th>Original Size</th>
                            <th>WebP Size</th>
                            <th>Status on Website</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($images_data)): ?>
                            <tr><td colspan="4" style="text-align:center;padding:20px;">No JPEG/PNG images found in media library.</td></tr>
                        <?php else: foreach ($images_data as $img): ?>
                            <tr>
                                <td style="font-weight:500;"><?php echo esc_html($img['name']); ?></td>
                                <td style="font-family:monospace;"><?php echo round($img['orig_size'] / 1024, 1); ?> KB</td>
                                <td style="font-family:monospace;">
                                    <?php echo $img['webp_size'] ? round($img['webp_size'] / 1024, 1) . ' KB' : '—'; ?>
                                </td>
                                <td>
                                    <?php if ($img['is_webp']): ?>
                                        <span style="color:#065f46;background:#d1fae5;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;">
                                            Serving WebP
                                        </span>
                                    <?php else: ?>
                                        <span style="color:#854d0e;background:#fef9c3;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;">
                                            Serving Original (<?php echo $enabled ? 'Not Converted' : 'WebP Disabled'; ?>)
                                        </span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- SEO Speed Audit & Recommended PHP Snippet -->
            <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
                <h3 style="margin:0 0 10px;font-size:16px;">Website SEO Speed Audit</h3>
                <p style="color:#555;font-size:13px;margin-bottom:15px;">Add this PHP snippet to your theme's <code>functions.php</code> to preload LCP images and enable native asynchronous decoding.</p>

                <div style="background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:12px;overflow-x:auto;">
<pre style="margin:0;">// OptiWebP Speed & SEO Booster Snippet
add_filter('wp_get_attachment_image_attributes', function($attr) {
    // Add asynchronous decoding and lazy loading
    $attr['decoding'] = 'async';
    if (!isset($attr['loading'])) {
        $attr['loading'] = 'lazy';
    }
    return $attr;
});

// Enable WebP browser caching headers
add_action('send_headers', function() {
    header('Vary: Accept');
});</pre>
                </div>
            </div>
        </div>

        <script>
        jQuery(document).ready(function($) {
            $('#optiwebp-toggle').on('change', function() {
                var isChecked = $(this).is(':checked');
                $.post(ajaxurl, {
                    action: 'optiwebp_toggle_status',
                    status: isChecked ? '1' : '0'
                }, function(res) {
                    location.reload();
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
    try_files $uri$webp_suffix $uri =404;
}
`;

const WP_README_TXT = `=== OptiWebP Image Optimizer & Speed Booster ===
Contributors: aialamin, alaminhossain
Author: Al Amin Hossain
Author URI: https://github.com/aialamin
Tags: webp, convert to webp, compress images, speed audit, webp toggle, performance
Requires at least: 5.6
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later

Automatically serves all WordPress photos as next-gen WebP images. Includes master WebP toggle (ON/OFF), image-by-image status statistics, and SEO speed audit.

== Features ==
* Master ON/OFF Switch: Turn WebP serving on or off anytime with 1 click.
* Image-by-Image Statistics: Shows exactly which photos are served as WebP vs originals.
* Automatic on-upload WebP generation for master images and all responsive thumbnail sizes.
* SEO Speed Audit with copyable PHP optimization snippet.
* Zero Lock-in: Retains original files completely safe.
* Direct Static WebP Delivery: Includes Apache (.htaccess) and Nginx rules for zero-PHP overhead.

== Installation ==
1. Download \`optiwebp-image-optimizer.zip\`.
2. Go to **Plugins > Add New > Upload Plugin** in your WordPress Admin.
3. Install and click **Activate**.
4. Visit the **OptiWebP** menu in your WP admin sidebar to toggle WebP ON/OFF, run bulk conversion on existing library images, and check Core Web Vitals speed scores!
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
