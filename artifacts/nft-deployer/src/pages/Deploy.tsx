import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletConnect } from "@/components/WalletConnect";
import { CollectionForm, CollectionFormValues } from "@/components/CollectionForm";
import { ArtworkUpload, ArtworkFile } from "@/components/ArtworkUpload";
import { RoyaltySettings, RoyaltySettingsValues } from "@/components/RoyaltySettings";
import { DeployStep } from "@/components/DeployStep";

const steps = [
  { id: "wallet", label: "Connect" },
  { id: "collection", label: "Details" },
  { id: "artwork", label: "Artwork" },
  { id: "royalties", label: "Royalties" },
  { id: "deploy", label: "Deploy" },
];

export default function DeployPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const [collection, setCollection] = useState<Partial<CollectionFormValues>>({});
  const [artworks, setArtworks] = useState<ArtworkFile[]>([]);
  const [royalties, setRoyalties] = useState<Partial<RoyaltySettingsValues>>({});

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVMMzkuNSAzOS41TDM5LjUgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Header / Nav */}
      <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <div className="w-3 h-3 bg-primary rounded-sm" />
            </div>
            <span className="font-bold tracking-wider text-white">FORGE</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 rounded bg-secondary/50">
            ERC-721 STUDIO
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 md:py-12 z-10">
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-secondary -z-10 -translate-y-1/2" />
            <motion.div 
              className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 shadow-[0_0_10px_rgba(0,240,255,0.5)]" 
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isPassed = index < currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isActive || isPassed ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                      borderColor: isActive ? "hsl(var(--primary))" : isPassed ? "hsl(var(--primary))" : "hsl(var(--border))",
                      scale: isActive ? 1.2 : 1
                    }}
                    className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors
                      ${isActive || isPassed ? "text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "text-muted-foreground"}
                    `}
                  >
                    {isPassed ? "✓" : index + 1}
                  </motion.div>
                  <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {currentStep === 0 && (
                <WalletConnect onNext={nextStep} />
              )}
              {currentStep === 1 && (
                <CollectionForm 
                  initialValues={collection}
                  onNext={(data) => {
                    setCollection(data);
                    nextStep();
                  }}
                  onBack={prevStep}
                />
              )}
              {currentStep === 2 && (
                <ArtworkUpload 
                  initialArtworks={artworks}
                  onNext={(data) => {
                    setArtworks(data);
                    nextStep();
                  }}
                  onBack={prevStep}
                />
              )}
              {currentStep === 3 && (
                <RoyaltySettings 
                  initialValues={royalties}
                  onNext={(data) => {
                    setRoyalties(data);
                    nextStep();
                  }}
                  onBack={prevStep}
                />
              )}
              {currentStep === 4 && (
                <DeployStep 
                  collection={collection as CollectionFormValues}
                  artworks={artworks}
                  royalties={royalties as RoyaltySettingsValues}
                  onBack={prevStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}