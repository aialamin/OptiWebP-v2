import React, { useState } from 'react';
import {
  Wallet,
  Check,
  Copy,
  FileJson,
  Coins,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  Web3WalletState,
  connectWeb3Wallet,
  generateIpfsMetadataJson,
  calculateIpfsCid,
  sendCryptoPayment,
  signWeb3Proof,
  DEFAULT_DEV_WALLET,
} from '../utils/web3';
import { triggerDownload } from '../utils/converter';
import { ConversionItem } from '../types';
import { SpotlightCard } from './animations/SpotlightCard';
import { DecryptedText } from './animations/DecryptedText';

interface Web3SectionProps {
  wallet: Web3WalletState;
  onWalletChange: (wallet: Web3WalletState) => void;
  items: ConversionItem[];
}

export const Web3Section: React.FC<Web3SectionProps> = ({
  wallet,
  onWalletChange,
  items,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [signedProof, setSignedProof] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [currentCid, setCurrentCid] = useState<string>('bafybeig7x4pvdv5s...w5jke');

  React.useEffect(() => {
    const completed = items.find((i) => i.status === 'completed' && i.outputBlob);
    if (completed && completed.outputBlob) {
      calculateIpfsCid(completed.outputBlob).then(setCurrentCid);
    }
  }, [items]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await connectWeb3Wallet();
      onWalletChange(res);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onWalletChange({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: '',
    });
    setSignedProof(null);
    setLastTxHash(null);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendTip = async () => {
    setIsProcessingPayment(true);
    setLastTxHash(null);
    const result = await sendCryptoPayment('0.002', DEFAULT_DEV_WALLET);
    setIsProcessingPayment(false);
    if (result.success && result.txHash) {
      setLastTxHash(result.txHash);
    }
  };

  const handleSignOwnership = async () => {
    if (!wallet.address) return;
    setIsSigning(true);
    const targetItem = items[0] || { name: 'optimized-image.webp' };
    const res = await signWeb3Proof(wallet.address, targetItem.name, currentCid);
    setSignedProof(res.signature);
    setIsSigning(false);
  };

  const handleDownloadNftMetadata = () => {
    const target = items.find((i) => i.status === 'completed') || items[0];
    const name = target ? target.name : 'digital-asset.webp';
    const jsonStr = generateIpfsMetadataJson(
      name,
      currentCid,
      target?.outputWidth || 1920,
      target?.outputHeight || 1080,
      target?.outputSize || 154000,
      target?.savingsPercent || 72,
      target?.seoMetadata?.title,
      target?.seoMetadata?.description,
      signedProof || undefined
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `${name.replace(/\.[^/.]+$/, '')}-nft-metadata.json`);
  };

  return (
    <section id="web3-integration" className="w-full my-8">
      <div className="bg-white dark:bg-[#11141b] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs transition-colors space-y-6">
        {/* Compact Header & Wallet Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Web3 & IPFS Tools
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Decentralized storage pinning, gasless ownership proofs, and NFT metadata.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 4)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="text-[11px] text-neutral-400 hover:text-rose-500 underline ml-1 cursor-pointer font-sans"
                >
                  Disconnect
                </button>
              </div>
            ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-all duration-150 cursor-pointer border border-neutral-200 dark:border-neutral-700 shadow-xs active:scale-95"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
            )}
          </div>
        </div>

        {/* Action Grid (Zero verbose paragraphs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. IPFS CID */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">IPFS CID</div>
              <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-1">
                ipfs://<DecryptedText text={currentCid} speed={25} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopy(`ipfs://${currentCid}`, 'cid')}
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {copiedKey === 'cid' ? 'Copied' : 'Copy URI'}
              </button>
              <a
                href={`https://ipfs.io/ipfs/${currentCid}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-0.5"
              >
                <span>Gateway</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 2. Gasless Proof */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">Ownership Proof</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {signedProof ? 'Proof Signed' : '0-gas cryptographic stamp'}
              </div>
            </div>
            <button
              onClick={handleSignOwnership}
              disabled={isSigning || !wallet.isConnected}
              className="w-full text-center py-1.5 px-2 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#0c0e12] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40"
            >
              {signedProof ? 'Re-sign Proof' : 'Sign Proof (0 Gas)'}
            </button>
          </div>

          {/* 3. NFT Metadata */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">NFT Token URI</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                ERC-721 standard metadata
              </div>
            </div>
            <button
              onClick={handleDownloadNftMetadata}
              className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#0c0e12] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <FileJson className="w-3 h-3" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* 4. Crypto Tip */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800 space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">Crypto Tip</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {lastTxHash ? 'Tip Confirmed' : '0.002 ETH supporter tip'}
              </div>
            </div>
            <button
              onClick={handleSendTip}
              disabled={isProcessingPayment}
              className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Coins className="w-3 h-3" />
              <span>{isProcessingPayment ? 'Sending...' : 'Tip 0.002 ETH'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
