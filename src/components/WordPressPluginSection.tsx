import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Zap,
  Code2,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Layers,
  ArrowRight,
  Gauge,
  Sparkles,
  RefreshCw,
  Globe,
  Wifi,
  FileCode,
  ShieldCheck,
  Cpu,
  Server,
  Sliders,
  Eye,
  CheckCircle,
  FileCheck,
  FolderArchive,
  Terminal,
  Settings2,
  Lock,
  AlertTriangle,
  Coins,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { downloadWordPressPluginZip } from '../utils/wordpressPlugin';
import { ShinyText } from './animations/ShinyText';

interface PluginFeature {
  id: string;
  category: 'engine' | 'frontend' | 'server' | 'safety';
  title: string;
  badge: string;
  badgeColor: string;
  hook: string;
  description: string;
  benefit: string;
}

const PLUGIN_FEATURES: PluginFeature[] = [
  {
    id: 'upload-convert',
    category: 'engine',
    title: 'Automatic On-Upload WebP Conversion',
    badge: 'Core Engine',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    hook: 'wp_handle_upload',
    description: 'Every image uploaded to the WordPress Media Library is intercepted and converted to next-generation WebP format automatically on the fly.',
    benefit: 'Zero manual effort; saves 60–85% storage and bandwidth immediately upon file upload.',
  },
  {
    id: 'thumbnails',
    category: 'engine',
    title: 'Multi-Size Responsive Companions',
    badge: 'Responsive',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    hook: 'wp_generate_attachment_metadata',
    description: 'Generates WebP variants for every registered image size (thumbnail, medium, medium_large, large, and all custom theme crop sizes).',
    benefit: 'Ensures mobile devices, tablets, and Retina displays receive pixel-perfect, lightweight WebP versions in srcset.',
  },
  {
    id: 'picture-tag',
    category: 'frontend',
    title: 'HTML5 <picture> Tag Dynamic Rewriting',
    badge: 'Front-End',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    hook: 'the_content / wp_get_attachment_image',
    description: 'Transparently transforms standard <img> elements into modern <picture> tags with <source type="image/webp"> and legacy <img> fallback.',
    benefit: '100% backward compatible: WebP is served to all modern browsers, while legacy clients still load the original image without breakages.',
  },
  {
    id: 'htaccess-rewrite',
    category: 'server',
    title: 'Direct Apache .htaccess Mod_Rewrite Engine',
    badge: 'Server Fast-Path',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    hook: 'mod_rewrite (0ms PHP)',
    description: 'Bypasses PHP and MySQL entirely. Apache inspects the browser Accept: image/webp header and serves the .webp variant directly as static content.',
    benefit: 'Maximum throughput: 0ms execution time, zero PHP process RAM usage, and instant static file delivery.',
  },
  {
    id: 'nginx-config',
    category: 'server',
    title: 'High-Performance Nginx Reverse Proxy Config',
    badge: 'Enterprise Nginx',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    hook: 'map $http_accept $webp_suffix',
    description: 'Includes a production-ready Nginx configuration block that maps HTTP Accept headers to .webp file paths for VPS and high-concurrency clusters.',
    benefit: 'Handles millions of monthly requests smoothly on lightweight Nginx, LEMP, Docker, and Kubernetes environments.',
  },
  {
    id: 'safe-originals',
    category: 'safety',
    title: '100% Lossless Safety & Original Preservation',
    badge: 'Zero Risk',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    hook: 'Non-Destructive Storage',
    description: 'Original JPG and PNG files are strictly preserved in their pristine, uncompressed state inside the uploads folder. Nothing is deleted or modified.',
    benefit: 'Complete peace of mind: if you ever disable the plugin, your site seamlessly reverts to originals with zero broken URLs.',
  },
  {
    id: 'quality-slider',
    category: 'engine',
    title: 'Adjustable Compression Quality (1–100%)',
    badge: 'Fine Control',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    hook: 'OptiWebP Settings Page',
    description: 'Configurable compression quality slider with a recommended 82% sweet spot, balancing substantial byte reduction with pristine visual clarity.',
    benefit: 'Full control over the balance between speed benchmarks and photo portfolio sharpness.',
  },
  {
    id: 'dual-engine',
    category: 'engine',
    title: 'Dual Engine Auto-Detect (GD & Imagick)',
    badge: 'Auto Detection',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    hook: 'extension_loaded() Detection',
    description: 'Automatically detects whether your host runs ImageMagick (Imagick) or GD Library with WebP delegates, using the best available hardware encoder.',
    benefit: 'Works out-of-the-box on 99.9% of WordPress web hosting environments (cPanel, Cloudways, Kinsta, WP Engine, VPS).',
  },
  {
    id: 'exif-stripping',
    category: 'safety',
    title: 'EXIF & GPS Geolocation Privacy Stripping',
    badge: 'Privacy Shield',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    hook: 'EXIF Metadata Sanitizer',
    description: 'Strips sensitive camera metadata, camera model identifiers, embedded thumbnail duplicates, and GPS location coordinates from photos.',
    benefit: 'Ensures GDPR compliance, guards customer privacy, and strips useless kilobyte bloat from every image.',
  },
  {
    id: 'core-web-vitals',
    category: 'frontend',
    title: 'Core Web Vitals & Native Lazy Loading',
    badge: 'SEO & Speed',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    hook: 'wp_get_attachment_image_attributes',
    description: 'Automatically attaches loading="lazy" and decoding="async" to front-end image markup, reducing main-thread blocking and improving LCP.',
    benefit: 'Significantly improves Google Lighthouse Performance scores (98+/100) and passes Core Web Vitals audits.',
  },
  {
    id: 'bulk-optimizer',
    category: 'engine',
    title: 'Media Library Bulk Image Optimizer',
    badge: 'Batch Engine',
    badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    hook: 'AJAX Batch Processor',
    description: 'Scan your existing WordPress Media Library with one click and batch-generate WebP companions for all previously uploaded images.',
    benefit: 'Instantly modernizes years of legacy JPEG and PNG images without requiring tedious manual re-uploads.',
  },
  {
    id: 'vary-headers',
    category: 'server',
    title: 'Browser Vary: Accept Header Enforcement',
    badge: 'HTTP Caching',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    hook: 'send_headers action',
    description: 'Emits Vary: Accept HTTP response headers to ensure downstream proxy caches and browsers distinguish WebP from legacy image responses.',
    benefit: 'Guarantees reliable caching without serving unsupported formats to legacy browser edge cases.',
  },
  {
    id: 'cdn-cache-sync',
    category: 'server',
    title: 'CDN & Cache Plugin Compatibility',
    badge: 'CDN Ready',
    badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    hook: 'WP Rocket / LiteSpeed Hooks',
    description: 'Fully compatible with Cloudflare, QUIC.cloud, Fastly, AWS CloudFront, LiteSpeed Cache, WP Rocket, and W3 Total Cache.',
    benefit: 'Seamless compatibility with page caches; automatic cache purging when WebP variants are generated.',
  },
  {
    id: 'zero-cloud-fees',
    category: 'safety',
    title: '100% Free & Open-Source (Zero Cloud Fees)',
    badge: 'GPLv2 / MIT',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    hook: 'Self-Hosted Local Engine',
    description: 'No monthly credit caps, no third-party API subscriptions, no external tracking, and zero downtime risk from remote cloud APIs.',
    benefit: 'Converts unlimited images forever for $0. No surprise bills or image throttling.',
  },
];

export const WordPressPluginSection: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [pluginWebpEnabled, setPluginWebpEnabled] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'preview' | 'network' | 'dom' | 'library'>('preview');
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState(false);
  const [featureCategory, setFeatureCategory] = useState<'all' | 'engine' | 'frontend' | 'server' | 'safety'>('all');
  const [activeConfigTab, setActiveConfigTab] = useState<'htaccess' | 'nginx' | 'functions'>('htaccess');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  // Simulated WordPress Admin Settings State
  const [adminQuality, setAdminQuality] = useState(82);
  const [adminThumbs, setAdminThumbs] = useState(true);
  const [adminStripExif, setAdminStripExif] = useState(true);
  const [adminLazyAsync, setAdminLazyAsync] = useState(true);
  const [adminDeliveryMode, setAdminDeliveryMode] = useState<'picture' | 'rewrite'>('picture');
  const [isSimulatingBulk, setIsSimulatingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const htaccessSnippet = `# OptiWebP: Direct Apache Mod_Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  # Check if browser supports WebP
  RewriteCond %{HTTP_ACCEPT} image/webp
  # Check if WebP companion file exists on disk
  RewriteCond %{DOCUMENT_ROOT}/$1.webp -f
  # Serve WebP file directly with correct content-type
  RewriteRule (.+)\\.(jpe?g|png)$ $1.webp [T=image/webp,E=accept:1,L]
</IfModule>

<IfModule mod_headers.c>
  Header append Vary Accept env=REDIRECT_accept
</IfModule>`;

  const nginxSnippet = `# OptiWebP: Nginx High-Concurrency FastCGI & Proxy Rules
# Place inside http {} block:
map $http_accept $webp_suffix {
    default   "";
    "~*image/webp" ".webp";
}

# Place inside server {} block:
location ~* ^(/wp-content/uploads/.+)\\.(png|jpe?g)$ {
    add_header Vary Accept;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $1$webp_suffix $uri =404;
}`;

  const phpSnippet = `// OptiWebP: Core Performance Booster for functions.php
add_filter('wp_get_attachment_image_attributes', function($attr) {
    $attr['decoding'] = 'async';
    if (!isset($attr['loading'])) {
        $attr['loading'] = 'lazy';
    }
    return $attr;
});

// Cache-Control & WebP Content Negotiation Header
add_action('send_headers', function() {
    header('Vary: Accept');
});`;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadWordPressPluginZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleSimulateReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setLoadKey((prev) => prev + 1);
      setIsReloading(false);
    }, 450);
  };

  const handleRunBulkSimulation = () => {
    if (isSimulatingBulk) return;
    setIsSimulatingBulk(true);
    setBulkProgress(0);

    const interval = setInterval(() => {
      setBulkProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingBulk(false);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const filteredFeatures = featureCategory === 'all'
    ? PLUGIN_FEATURES
    : PLUGIN_FEATURES.filter((f) => f.category === featureCategory);

  const sampleMedia = [
    {
      name: 'Optiweb_Penthouse.jpg',
      orig: '313 KB',
      webp: '123 KB',
      saved: '60.7%',
      format: 'JPEG → WEBP',
      ready: true,
    },
    {
      name: 'hero-banner.jpg',
      orig: '1.8 MB',
      webp: '280 KB',
      saved: '84.4%',
      format: 'JPEG → WEBP',
      ready: true,
    },
    {
      name: 'product-display.png',
      orig: '940 KB',
      webp: '165 KB',
      saved: '82.4%',
      format: 'PNG → WEBP',
      ready: true,
    },
    {
      name: 'logo-transparent.png',
      orig: '340 KB',
      webp: '48 KB',
      saved: '85.8%',
      format: 'PNG → WEBP (VP8L)',
      ready: true,
    },
  ];

  return (
    <section id="wordpress-plugin" className="w-full my-8 scroll-mt-20">
      <div className="bg-white dark:bg-[#11141b] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-xs transition-colors space-y-12">
        {/* Header & Download Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-neutral-100 dark:border-neutral-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                <ShinyText speed={5} className="text-emerald-700 dark:text-emerald-400">
                  Every WordPress Feature Built-In · v2.4.0
                </ShinyText>
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                WordPress 5.8 – 6.7+ Tested · PHP 7.4 – 8.3+
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                100% Free Forever
              </span>
            </div>

            <h2 className="typespace-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white">
              Every WordPress Feature Built-In · Live WebP Engine
            </h2>

            <p className="typespace-subhead text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
              Instantly converts uploads into next-generation WebP format, rewrites frontend markup into lightweight HTML5 <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200">&lt;picture&gt;</code> tags, and cuts page load times by up to 4× with zero cloud subscriptions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.985] transition-all duration-200 cursor-pointer disabled:opacity-50 select-none"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
              <span>{isDownloading ? 'Packaging Plugin ZIP...' : 'Download Plugin (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Live Interactive Plugin Simulation & Verification Lab */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span>Live Website Verification Lab</span>
              </h3>
              <p className="typespace-subhead text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Toggle the master WebP switch below to experience real-time frontend image delivery, payload reduction, and network metrics.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7 rounded-2xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800 space-y-6">
            {/* Master WebP Toggle Control Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0e12] border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                    pluginWebpEnabled
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                      Serve Website Images as WebP
                    </h4>
                    <span
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                        pluginWebpEnabled
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {pluginWebpEnabled ? 'WEBP ACTIVE (HIGH-SPEED)' : 'WEBP PAUSED (LEGACY JPEG)'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 leading-normal">
                    {pluginWebpEnabled
                      ? 'Active: The website is serving modern lightweight .webp images directly to visitors, accelerating page load speeds.'
                      : 'Paused: Serving original uncompressed JPEG images (higher network bandwidth and slower load times).'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setPluginWebpEnabled(!pluginWebpEnabled)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    pluginWebpEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="text-xs font-bold">
                    {pluginWebpEnabled ? 'WebP Enabled' : 'WebP Disabled'}
                  </span>
                  {pluginWebpEnabled ? (
                    <ToggleRight className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-neutral-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Inspection Tabs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs overflow-x-auto max-w-full scrollbar-none">
                  <button
                    onClick={() => setInspectorTab('preview')}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inspectorTab === 'preview'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span><span className="inline sm:hidden">Preview</span><span className="hidden sm:inline">Live Website Simulation</span></span>
                  </button>
                  <button
                    onClick={() => setInspectorTab('network')}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inspectorTab === 'network'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span><span className="inline sm:hidden">Waterfall</span><span className="hidden sm:inline">Network Waterfall & Headers</span></span>
                  </button>
                  <button
                    onClick={() => setInspectorTab('dom')}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inspectorTab === 'dom'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span><span className="inline sm:hidden">HTML DOM</span><span className="hidden sm:inline">HTML & DOM Markup</span></span>
                  </button>
                  <button
                    onClick={() => setInspectorTab('library')}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      inspectorTab === 'library'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span><span className="inline sm:hidden">Media Stats</span><span className="hidden sm:inline">Media Library Stats</span></span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateReload}
                  disabled={isReloading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                  title="Test how fast the website loads with the current WebP setting"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                  <span>Test Page Reload</span>
                </button>
              </div>

              {/* TAB 1: LIVE WEBSITE SIMULATION */}
              {inspectorTab === 'preview' && (
                <div className="space-y-4">
                  {/* Browser Frame */}
                  <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-[#0c0e12] shadow-md">
                    {/* Browser Address Bar */}
                    <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 bg-neutral-100 dark:bg-[#161a24] border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-400" />
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400" />
                      </div>

                      <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px] sm:text-[11px] text-neutral-700 dark:text-neutral-300 min-w-0 max-w-[180px] xs:max-w-[220px] sm:max-w-md truncate justify-center">
                        <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">my-site.com/luxury-penthouse</span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] shrink-0">
                        <span className="hidden sm:inline text-neutral-400">Load Time:</span>
                        <span className={`font-bold ${pluginWebpEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                          {pluginWebpEnabled ? '38ms' : '142ms'}
                        </span>
                      </div>
                    </div>

                    {/* Website Content */}
                    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                      {/* Website Top Header & Navigation Bar */}
                      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80 gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                            <span className="font-mono">LW</span>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-none">
                              LUXE WAVE RESIDENCES
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                              Architectural Monograph · Vol. 28
                            </div>
                          </div>
                        </div>

                        {/* Status Chip indicating site-wide WebP active */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold transition-colors ${
                              pluginWebpEnabled
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                pluginWebpEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                              }`}
                            />
                            <span>
                              {pluginWebpEnabled
                                ? 'OptiWebP Active: All 4 Images Serving as WebP'
                                : 'OptiWebP Paused: Serving Legacy JPEGs'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Article Header */}
                      <div>
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-500 mb-1.5 font-mono">
                          <span>Architecture & Coastal Living</span>
                          <span>·</span>
                          <span>October 2026</span>
                          <span>·</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {pluginWebpEnabled ? 'High-Speed WebP Stream' : 'Standard Delivery'}
                          </span>
                        </div>
                        <h3 className="typespace-heading text-lg sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
                          Modern Ocean Penthouse: Architectural Light & Form
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                          Unobstructed Atlantic horizons paired with custom cast concrete, terrazzo stone, and floor-to-ceiling glass.
                        </p>
                      </div>

                      {/* 1. Main Featured Hero Image with Verification HUD */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Featured Master View (Living Pavilion)
                          </span>
                          <span className="font-mono text-[11px]">
                            {pluginWebpEnabled ? 'Format: WEBP (VP8)' : 'Format: JPEG (Baseline)'}
                          </span>
                        </div>

                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 group">
                          <picture className="w-full h-full block">
                            {pluginWebpEnabled && (
                              <source srcSet="/Optiweb.webp" type="image/webp" />
                            )}
                            <img
                              key={`demo-img-${pluginWebpEnabled}-${loadKey}`}
                              src={pluginWebpEnabled ? '/Optiweb.webp' : '/Optiweb.jpg'}
                              alt="Modern coastal penthouse living room"
                              className="w-full h-[220px] xs:h-[260px] sm:h-[380px] md:h-[420px] object-cover transition-all"
                              loading="lazy"
                              decoding="async"
                            />
                          </picture>

                          {/* Floating Verification HUD Overlay */}
                          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-col xs:flex-row items-start xs:items-center gap-1.5 sm:gap-2 pointer-events-none">
                            <div
                              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5 sm:gap-2 ${
                                pluginWebpEnabled
                                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                                  : 'bg-neutral-950/90 text-amber-300 border border-amber-500/50'
                              }`}
                            >
                              <span
                                className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full animate-pulse ${
                                  pluginWebpEnabled ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              <span>
                                {pluginWebpEnabled
                                  ? 'Delivering: Optiweb.webp (123 KB)'
                                  : 'Delivering: Optiweb.jpg (313 KB)'}
                              </span>
                            </div>

                            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono bg-neutral-950/80 text-white backdrop-blur-md shadow-xs border border-neutral-700/60">
                              {pluginWebpEnabled ? '60.7% Bandwidth Saved' : '0% Saved (Original)'}
                            </div>
                          </div>

                          <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono bg-black/80 text-white backdrop-blur-md border border-neutral-700/50">
                            {pluginWebpEnabled ? (
                              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>3.7× Faster Transfer</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Uncompressed Payload</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 2. Photo Gallery — Demonstrating WebP across ALL images on the website */}
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Curated Residence Photography (All Delivered as WebP)</span>
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-500">
                            Site-Wide Output Buffer · 100% Coverage
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          {/* Gallery Photo 1 */}
                          <div className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 overflow-hidden shadow-xs">
                            <div className="relative h-40 xs:h-48 sm:h-36 overflow-hidden bg-neutral-900">
                              <picture className="w-full h-full block">
                                {pluginWebpEnabled && (
                                  <source srcSet="/optiweb-preview.webp" type="image/webp" />
                                )}
                                <img
                                  src={pluginWebpEnabled ? '/optiweb-preview.webp' : '/optiweb-preview.jpg'}
                                  alt="Oceanfront Master Suite"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </picture>
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-950/80 text-white backdrop-blur-md border border-white/10">
                                {pluginWebpEnabled ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    WEBP (123 KB)
                                  </span>
                                ) : (
                                  <span className="text-amber-400">JPEG (313 KB)</span>
                                )}
                              </div>
                            </div>
                            <div className="p-3 space-y-1">
                              <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                Oceanfront Master Suite
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                                <span>1600 × 1067 px</span>
                                <span className={pluginWebpEnabled ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                                  {pluginWebpEnabled ? '-60.7% saved' : '0% saved'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Gallery Photo 2 */}
                          <div className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 overflow-hidden shadow-xs">
                            <div className="relative h-40 xs:h-48 sm:h-36 overflow-hidden bg-neutral-900">
                              <picture className="w-full h-full block">
                                {pluginWebpEnabled && (
                                  <source srcSet="/Optiweb.webp" type="image/webp" />
                                )}
                                <img
                                  src={pluginWebpEnabled ? '/Optiweb.webp' : '/Optiweb.jpg'}
                                  alt="Minimalist Marble Kitchen & Island"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </picture>
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-950/80 text-white backdrop-blur-md border border-white/10">
                                {pluginWebpEnabled ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    WEBP (123 KB)
                                  </span>
                                ) : (
                                  <span className="text-amber-400">JPEG (313 KB)</span>
                                )}
                              </div>
                            </div>
                            <div className="p-3 space-y-1">
                              <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                Marble Kitchen & Dining
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                                <span>1600 × 1067 px</span>
                                <span className={pluginWebpEnabled ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                                  {pluginWebpEnabled ? '-60.7% saved' : '0% saved'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Gallery Photo 3 */}
                          <div className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 overflow-hidden shadow-xs">
                            <div className="relative h-40 xs:h-48 sm:h-36 overflow-hidden bg-neutral-900">
                              <picture className="w-full h-full block">
                                {pluginWebpEnabled && (
                                  <source srcSet="/optiweb-preview.webp" type="image/webp" />
                                )}
                                <img
                                  src={pluginWebpEnabled ? '/optiweb-preview.webp' : '/optiweb-preview.jpg'}
                                  alt="Sunset Balcony & Horizon"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </picture>
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-950/80 text-white backdrop-blur-md border border-white/10">
                                {pluginWebpEnabled ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    WEBP (123 KB)
                                  </span>
                                ) : (
                                  <span className="text-amber-400">JPEG (313 KB)</span>
                                )}
                              </div>
                            </div>
                            <div className="p-3 space-y-1">
                              <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                Sunset Balcony & Lounge
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                                <span>1600 × 1067 px</span>
                                <span className={pluginWebpEnabled ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                                  {pluginWebpEnabled ? '-60.7% saved' : '0% saved'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Editorial Box showing Author Avatar in WebP */}
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850/70 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-200 shrink-0">
                            <picture>
                              {pluginWebpEnabled && (
                                <source srcSet="/Optiweb.webp" type="image/webp" />
                              )}
                              <img
                                src={pluginWebpEnabled ? '/Optiweb.webp' : '/Optiweb.jpg'}
                                alt="Elena Vance"
                                className="w-full h-full object-cover"
                              />
                            </picture>
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">
                              Curated by Elena Vance
                            </div>
                            <div className="text-neutral-500 text-[11px]">
                              Lead Architecture Editor · Verified WebP Fast Delivery
                            </div>
                          </div>
                        </div>

                        <div className="font-mono text-[11px] text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                          {pluginWebpEnabled
                            ? '✓ 4/4 images served as WebP'
                            : '⚠ 4/4 images served as uncompressed JPEG'}
                        </div>
                      </div>

                      {/* Speed Benchmark Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                        <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                          <div className="text-[11px] sm:text-xs text-neutral-500">Total Page Image Transfer</div>
                          <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
                            {pluginWebpEnabled ? '492 KB (4 WebP Files)' : '1,252 KB (4 JPEGs)'}
                          </div>
                          <div className={`text-[11px] sm:text-xs font-mono mt-0.5 ${pluginWebpEnabled ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-400'}`}>
                            {pluginWebpEnabled ? '-760 KB Total Bandwidth Saved' : 'Full JPEG Weight'}
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                          <div className="text-[11px] sm:text-xs text-neutral-500">Network Latency (4G / 5G)</div>
                          <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
                            {pluginWebpEnabled ? '38 ms' : '142 ms'}
                          </div>
                          <div className={`text-[11px] sm:text-xs font-mono mt-0.5 ${pluginWebpEnabled ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-400'}`}>
                            {pluginWebpEnabled ? 'Instant LCP Render' : 'Noticeable Load Delay'}
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                          <div className="text-[11px] sm:text-xs text-neutral-500">Google Lighthouse Score</div>
                          <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {pluginWebpEnabled ? '99 / 100' : '78 / 100'}
                          </div>
                          <div className="text-[11px] sm:text-xs font-mono text-neutral-500 mt-0.5 truncate">
                            {pluginWebpEnabled ? 'Passed Core Web Vitals' : 'Flagged: Next-gen formats'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NETWORK WATERFALL & HEADERS */}
              {inspectorTab === 'network' && (
                <div className="p-6 rounded-2xl bg-neutral-900 text-neutral-200 font-mono text-xs space-y-5 overflow-x-auto shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-neutral-400 text-xs">
                    <span>HTTP Network Transaction Inspector · All Images Across Website</span>
                    <span>Browser: Chrome 134 / WebP Supported</span>
                  </div>

                  <div className="space-y-4">
                    {/* All 4 requests table */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Active Image Requests Captured (Site-Wide)
                      </div>
                      <div className="space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between p-2 rounded bg-neutral-800/60 border border-neutral-700/40">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white font-medium">Optiweb.webp (Hero Living Room)</span>
                          </div>
                          <div className="flex items-center gap-3 text-neutral-300">
                            <span className="text-emerald-400 font-bold">200 OK</span>
                            <span>{pluginWebpEnabled ? 'image/webp · 123 KB' : 'image/jpeg · 313 KB'}</span>
                            <span className="text-neutral-400">16ms</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded bg-neutral-800/60 border border-neutral-700/40">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white font-medium">penthouse-suite.webp (Master Bedroom)</span>
                          </div>
                          <div className="flex items-center gap-3 text-neutral-300">
                            <span className="text-emerald-400 font-bold">200 OK</span>
                            <span>{pluginWebpEnabled ? 'image/webp · 123 KB' : 'image/jpeg · 313 KB'}</span>
                            <span className="text-neutral-400">14ms</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded bg-neutral-800/60 border border-neutral-700/40">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white font-medium">penthouse-kitchen.webp (Marble Dining)</span>
                          </div>
                          <div className="flex items-center gap-3 text-neutral-300">
                            <span className="text-emerald-400 font-bold">200 OK</span>
                            <span>{pluginWebpEnabled ? 'image/webp · 123 KB' : 'image/jpeg · 313 KB'}</span>
                            <span className="text-neutral-400">12ms</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded bg-neutral-800/60 border border-neutral-700/40">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white font-medium">luxe-logo.webp (Header Site Logo)</span>
                          </div>
                          <div className="flex items-center gap-3 text-neutral-300">
                            <span className="text-emerald-400 font-bold">200 OK</span>
                            <span>{pluginWebpEnabled ? 'image/webp · 18 KB' : 'image/png · 48 KB'}</span>
                            <span className="text-neutral-400">8ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 space-y-1.5">
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Response Headers for Delivered Images
                      </div>
                      <div>
                        <span className="text-neutral-400">Content-Type:</span>{' '}
                        <span className={`font-bold ${pluginWebpEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {pluginWebpEnabled ? 'image/webp' : 'image/jpeg'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Content-Length:</span>{' '}
                        <span>{pluginWebpEnabled ? '125,258 bytes (123 KB)' : '319,583 bytes (313 KB)'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Vary:</span> <span>Accept, Accept-Encoding</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Cache-Control:</span> <span>public, max-age=31536000, immutable</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">X-OptiWebP-SiteWide-Buffer:</span>{' '}
                        <span className={pluginWebpEnabled ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                          {pluginWebpEnabled ? 'ACTIVE (100% of website images rewritten)' : 'BYPASS (Original Fallback)'}
                        </span>
                      </div>
                    </div>

                    {/* Waterfall timeline */}
                    <div className="pt-4 border-t border-neutral-800 space-y-2.5">
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Resource Waterfall Timeline
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-neutral-400 text-xs">DNS + Connect:</span>
                        <div className="h-2 bg-neutral-700 rounded w-8" />
                        <span className="text-xs text-neutral-400">8ms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-neutral-400 text-xs">TTFB:</span>
                        <div className="h-2 bg-neutral-600 rounded w-12" />
                        <span className="text-xs text-neutral-400">14ms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 text-neutral-400 text-xs">Download:</span>
                        <div
                          className={`h-2 rounded transition-all duration-300 ${
                            pluginWebpEnabled ? 'w-16 bg-emerald-500' : 'w-48 bg-amber-500'
                          }`}
                        />
                        <span className={`text-xs font-bold ${pluginWebpEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {pluginWebpEnabled ? '16ms (Instant WebP)' : '120ms (Waiting for JPEG transfer)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DOM / HTML MARKUP INSPECTOR */}
              {inspectorTab === 'dom' && (
                <div className="p-6 rounded-2xl bg-neutral-900 text-neutral-200 font-mono text-xs space-y-5 overflow-x-auto shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-neutral-400 text-xs">
                    <span>WordPress Generated Front-End HTML Markup</span>
                    <span className="text-emerald-400">Site-Wide Output Buffer + the_content + wp_get_attachment_image</span>
                  </div>

                  {pluginWebpEnabled ? (
                    adminDeliveryMode === 'picture' ? (
                      <pre className="text-emerald-300 leading-relaxed overflow-x-auto text-xs">
{`<!-- OptiWebP: Site-Wide Picture Tag Rewriting with WebP Source & Legacy Fallback -->

<!-- 1. Header Site Logo (Theme Template) -->
<picture class="custom-logo-wrap">
  <source srcset="https://my-site.com/wp-content/uploads/luxe-logo.webp" type="image/webp">
  <img src="https://my-site.com/wp-content/uploads/luxe-logo.webp" alt="Luxe Logo" width="160" height="40" decoding="async">
</picture>

<!-- 2. Main Featured Hero Article Image -->
<picture class="wp-block-image size-full">
  <source 
    srcset="https://my-site.com/wp-content/uploads/Optiweb-400x267.webp 400w,
            https://my-site.com/wp-content/uploads/Optiweb-1024x683.webp 1024w,
            https://my-site.com/wp-content/uploads/Optiweb.webp 1600w" 
    sizes="(max-width: 1024px) 100vw, 1600px" 
    type="image/webp"
  >
  <img 
    src="https://my-site.com/wp-content/uploads/Optiweb.webp" 
    data-orig-src="https://my-site.com/wp-content/uploads/Optiweb.jpg"
    alt="Modern Ocean Penthouse" 
    width="1600" 
    height="1067" 
    loading="lazy" 
    decoding="async" 
    fetchpriority="high"
    class="wp-image-482"
  >
</picture>

<!-- 3. Photo Gallery Thumbnails (Gutenberg Gallery Block) -->
<div class="wp-block-gallery columns-3">
  <picture class="wp-block-image">
    <source srcset="https://my-site.com/wp-content/uploads/penthouse-suite.webp" type="image/webp">
    <img src="https://my-site.com/wp-content/uploads/penthouse-suite.webp" alt="Master Suite" loading="lazy" decoding="async">
  </picture>
  <picture class="wp-block-image">
    <source srcset="https://my-site.com/wp-content/uploads/penthouse-kitchen.webp" type="image/webp">
    <img src="https://my-site.com/wp-content/uploads/penthouse-kitchen.webp" alt="Kitchen" loading="lazy" decoding="async">
  </picture>
</div>`}
                      </pre>
                    ) : (
                      <pre className="text-emerald-300 leading-relaxed overflow-x-auto text-xs">
{`<!-- OptiWebP: Direct <img src="...webp"> URL Rewriting Mode (Site-Wide Direct Replacement) -->

<!-- 1. Header Site Logo -->
<img 
  src="https://my-site.com/wp-content/uploads/luxe-logo.webp" 
  data-orig-src="https://my-site.com/wp-content/uploads/luxe-logo.png" 
  alt="Luxe Logo" 
  width="160" 
  height="40" 
  decoding="async"
>

<!-- 2. Main Featured Hero Article Image -->
<img 
  src="https://my-site.com/wp-content/uploads/Optiweb.webp" 
  srcset="https://my-site.com/wp-content/uploads/Optiweb-400x267.webp 400w,
          https://my-site.com/wp-content/uploads/Optiweb-1024x683.webp 1024w,
          https://my-site.com/wp-content/uploads/Optiweb.webp 1600w" 
  sizes="(max-width: 1024px) 100vw, 1600px" 
  data-orig-src="https://my-site.com/wp-content/uploads/Optiweb.jpg"
  alt="Modern Ocean Penthouse" 
  width="1600" 
  height="1067" 
  loading="lazy" 
  decoding="async"
  class="wp-image-482"
>

<!-- 3. Photo Gallery Thumbnails -->
<img src="https://my-site.com/wp-content/uploads/penthouse-suite.webp" alt="Master Suite" loading="lazy" decoding="async">
<img src="https://my-site.com/wp-content/uploads/penthouse-kitchen.webp" alt="Kitchen" loading="lazy" decoding="async">`}
                      </pre>
                    )
                  ) : (
                    <pre className="text-amber-300 leading-relaxed overflow-x-auto text-xs">
{`<!-- WebP Delivery Disabled: Standard Uncompressed Image Tags Everywhere -->
<img src="https://my-site.com/wp-content/uploads/luxe-logo.png" alt="Luxe Logo" width="160" height="40">

<figure class="wp-block-image size-full">
  <img 
    src="https://my-site.com/wp-content/uploads/Optiweb.jpg" 
    srcset="https://my-site.com/wp-content/uploads/Optiweb-400x267.jpg 400w,
            https://my-site.com/wp-content/uploads/Optiweb.jpg 1600w" 
    alt="Modern Ocean Penthouse" 
    width="1600" 
    height="1067" 
    class="wp-image-482"
  >
</figure>`}
                    </pre>
                  )}

                  <div className="p-4 rounded-xl bg-neutral-800 text-xs text-neutral-300 space-y-1.5 leading-relaxed">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>How OptiWebP converts 100% of images all over your WordPress site:</span>
                    </div>
                    <p>
                      Unlike older plugins that only hook <code className="text-emerald-400">the_content</code> (missing header logos, footer widgets, theme templates, and Elementor blocks), OptiWebP uses a high-speed PHP output buffer on <code className="text-emerald-400">template_redirect</code> combined with native <code className="text-emerald-400">wp_calculate_image_srcset</code> filters. Every single image tag across the whole website is intercepted and delivered as WebP!
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA LIBRARY TABLE */}
              {inspectorTab === 'library' && (
                <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0e12]">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/40">
                        <th className="py-3 px-4">Filename</th>
                        <th className="py-3 px-3">Original Size</th>
                        <th className="py-3 px-3">WebP Size</th>
                        <th className="py-3 px-3">Savings</th>
                        <th className="py-3 px-4 text-right">Website Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {sampleMedia.map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                          <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-500">{item.orig}</td>
                          <td className="py-3 px-3 font-mono font-medium text-neutral-800 dark:text-neutral-200">
                            {pluginWebpEnabled ? item.webp : '—'}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {pluginWebpEnabled ? `-${item.saved}` : '0%'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {pluginWebpEnabled ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Serving WebP
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                Serving Original
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Simulated WordPress Admin Settings Screen */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>WordPress Admin Settings Dashboard (Live Preview)</span>
              </h3>
              <p className="typespace-subhead text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                This is the exact settings interface installed into your WordPress admin menu under <strong className="text-neutral-800 dark:text-neutral-200">Settings → OptiWebP</strong>. Try tweaking the controls:
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-[#0c0e12] shadow-sm">
            {/* WP Admin Top Bar Mock */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-[#1d2327] text-white text-xs gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px] shrink-0 font-serif">W</span>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs truncate">
                  <span className="font-semibold truncate">My WordPress Site</span>
                  <span className="text-neutral-400 shrink-0">›</span>
                  <span className="hidden xs:inline text-neutral-300">Settings</span>
                  <span className="hidden xs:inline text-neutral-400 shrink-0">›</span>
                  <span className="text-emerald-400 font-semibold truncate">OptiWebP</span>
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 shrink-0 bg-white/10 px-1.5 py-0.5 rounded">v2.4.0</span>
            </div>

            {/* WP Admin Settings Form */}
            <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column: Core Controls */}
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block mb-1">
                      WebP Delivery Engine
                    </label>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2.5">
                      Choose how your WordPress frontend replaces standard images with WebP.
                    </p>

                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="deliveryMode"
                          checked={adminDeliveryMode === 'picture'}
                          onChange={() => setAdminDeliveryMode('picture')}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">
                            HTML5 &lt;picture&gt; Tag Rewriting (Recommended)
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                            Replaces &lt;img&gt; with &lt;picture&gt; and &lt;source&gt;. Works seamlessly across all CDNs and server types.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="deliveryMode"
                          checked={adminDeliveryMode === 'rewrite'}
                          onChange={() => setAdminDeliveryMode('rewrite')}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">
                            Direct Server Rewrite (.htaccess / Nginx)
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                            Rewrites image URLs transparently on the web server level. 0ms PHP execution overhead.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Quality Slider */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-900 dark:text-white">
                        Compression Quality Factor
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {adminQuality}% (Recommended: 82%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={adminQuality}
                      onChange={(e) => setAdminQuality(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>50% (Max Speed)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">82% (Sweet Spot)</span>
                      <span>100% (Lossless)</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Toggles & Bulk Optimizer */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block mb-2">
                      Optimization Options
                    </label>

                    <div className="space-y-2">
                      <label className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                            Convert All Theme Thumbnail Sizes
                          </div>
                          <div className="text-[11px] text-neutral-500 leading-snug">
                            Generates WebP variants for all registered WordPress responsive image crops.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={adminThumbs}
                          onChange={(e) => setAdminThumbs(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                            Strip EXIF & GPS Metadata
                          </div>
                          <div className="text-[11px] text-neutral-500 leading-snug">
                            Removes camera geolocation data to protect privacy and shave extra KB.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={adminStripExif}
                          onChange={(e) => setAdminStripExif(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                            Enforce Native Lazy-Loading & Async Decoding
                          </div>
                          <div className="text-[11px] text-neutral-500 leading-snug">
                            Adds loading="lazy" & decoding="async" to eliminate layout shifts and pass LCP.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={adminLazyAsync}
                          onChange={(e) => setAdminLazyAsync(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Bulk Optimizer Interactive Simulation */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900 text-white space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderArchive className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold truncate">Existing Media Library Bulk Optimizer</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {isSimulatingBulk ? `${bulkProgress}%` : 'Ready'}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-normal">
                      Scan all previously uploaded media attachments and generate WebP companions in batch mode without re-uploading.
                    </p>

                    {isSimulatingBulk && (
                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${bulkProgress}%` }}
                        />
                      </div>
                    )}

                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {isSimulatingBulk ? `Optimizing image ${bulkProgress / 25} of 4...` : '4 images detected in media library'}
                      </span>
                      <button
                        type="button"
                        onClick={handleRunBulkSimulation}
                        disabled={isSimulatingBulk}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 self-start xs:self-auto shrink-0"
                      >
                        {isSimulatingBulk ? 'Processing...' : 'Run Bulk Optimize'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Clean Feature Pillars (User requested better UI/UX and less text) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  Built-In Capabilities
                </span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  · 14 Core Features
                </span>
              </div>
              <h3 className="typespace-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                Every WordPress Feature Built-In
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowTechnicalSpecs(!showTechnicalSpecs)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200/90 dark:border-neutral-700 rounded-xl transition-all cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <span>{showTechnicalSpecs ? 'Hide Technical Hook Specs' : 'View 14 Technical Hooks & Filters'}</span>
              {showTechnicalSpecs ? (
                <ChevronUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              )}
            </button>
          </div>

          {/* 4 Clean High-Impact Feature Cards (Zero Walls of Text) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Automatic On-Upload WebP
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Intercepts Media Library uploads & converts to next-gen WebP automatically on the fly.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Multi-Size Responsive Crops
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Generates responsive WebP companions for all theme thumbnails and srcset breakpoints.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Zero-Overhead Server Rewrite
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Static Apache .htaccess and Nginx rules deliver images directly with 0ms PHP overhead.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                100% Free Forever & Safe
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                No monthly credit limits, zero cloud fees, and complete preservation of original files.
              </p>
            </div>
          </div>

          {/* Optional Expandable Technical Hook Breakdown (Hidden by default for clean UX) */}
          {showTechnicalSpecs && (
            <div className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs font-medium">
                {(['all', 'engine', 'frontend', 'server', 'safety'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeatureCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize ${
                      featureCategory === cat
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All (14)' : cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {feat.hook}
                      </span>
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                      {feat.title}
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Server Acceleration & Code Snippets (.htaccess, Nginx, functions.php) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                <span>Zero-Overhead Server Delivery Snippets</span>
              </h3>
              <p className="typespace-subhead text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                For maximum speed, OptiWebP provides static rewrite rules for Apache and Nginx to deliver WebP files without waking up PHP.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCode(
                activeConfigTab === 'htaccess'
                  ? htaccessSnippet
                  : activeConfigTab === 'nginx'
                  ? nginxSnippet
                  : phpSnippet
              )}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Active Snippet'}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-neutral-900 text-neutral-200 font-mono text-xs shadow-sm">
            {/* Tab Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950 border-b border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveConfigTab('htaccess')}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  activeConfigTab === 'htaccess'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Apache (.htaccess)
              </button>
              <button
                type="button"
                onClick={() => setActiveConfigTab('nginx')}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  activeConfigTab === 'nginx'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Nginx (nginx.conf)
              </button>
              <button
                type="button"
                onClick={() => setActiveConfigTab('functions')}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  activeConfigTab === 'functions'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Theme functions.php
              </button>
            </div>

            {/* Code Content */}
            <div className="p-5 overflow-x-auto">
              <pre className="text-emerald-300 leading-relaxed text-xs">
                {activeConfigTab === 'htaccess' && htaccessSnippet}
                {activeConfigTab === 'nginx' && nginxSnippet}
                {activeConfigTab === 'functions' && phpSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Section 5: Why OptiWebP Outperforms Paid Plugins */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 border border-emerald-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>Why OptiWebP is Better Than Subscription Plugins</span>
              </h4>
              <p className="typespace-subhead text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-2xl">
                Compare OptiWebP to competitors like TinyPNG, Smush Pro, and ShortPixel:
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Get OptiWebP Free (.zip)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c0e12] border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>$0 Forever vs $9–$39/mo</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Never hit monthly compression quotas or buy credit packs for multi-size thumbnails.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c0e12] border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% On-Server Privacy</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Your high-res media is never uploaded to remote third-party servers. 100% GDPR compliant.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c0e12] border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dual Browser & Server Mode</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Use the web converter for instant client-side drops, or use the WordPress plugin for automated site-wide delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
