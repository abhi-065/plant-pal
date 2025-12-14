import { useState } from 'react';
import { Leaf, Sprout, ArrowRight } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { PlantAnalysisResults } from '@/components/PlantAnalysisResults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [acres, setAcres] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImageSelect = (base64: string) => {
    setImageBase64(base64);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast({
        title: "No image selected",
        description: "Please upload a plant photo to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-plant', {
        body: {
          imageBase64,
          acres: acres ? parseFloat(acres) : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setAnalysisResult(data);
      toast({
        title: "Analysis complete!",
        description: `Identified: ${data.plantName || 'Unknown plant'}`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze the plant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageBase64(null);
    setAcres('');
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen gradient-nature">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-glow">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">PlantScan AI</h1>
              <p className="text-xs text-muted-foreground">Intelligent Plant Identification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-20">
        {/* Hero Section */}
        {!analysisResult && (
          <section className="text-center max-w-2xl mx-auto mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sprout className="w-4 h-4" />
              AI-Powered Plant Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Discover Everything About
              <span className="text-gradient block mt-1">Your Plants</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Upload a photo of any plant and get detailed insights including species info, 
              care instructions, pest management, and yield predictions.
            </p>
          </section>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!analysisResult ? (
            <div className="space-y-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
              {/* Image Uploader */}
              <ImageUploader 
                onImageSelect={handleImageSelect} 
                isLoading={isAnalyzing}
              />

              {/* Acres Input */}
              {imageBase64 && (
                <div className="glass rounded-xl p-6 space-y-4 animate-scale-in">
                  <div className="space-y-2">
                    <Label htmlFor="acres" className="text-sm font-medium">
                      Land Area (Optional)
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="acres"
                        type="number"
                        placeholder="Enter number of acres"
                        value={acres}
                        onChange={(e) => setAcres(e.target.value)}
                        className="flex-1"
                        min="0"
                        step="0.1"
                      />
                      <span className="flex items-center text-muted-foreground text-sm">
                        acres
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your cultivation area to get yield predictions and revenue estimates
                    </p>
                  </div>

                  {/* Analyze Button */}
                  <Button 
                    variant="hero" 
                    size="xl" 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Leaf className="w-5 h-5 animate-pulse" />
                        Analyzing Plant...
                      </>
                    ) : (
                      <>
                        Analyze Plant
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Features */}
              {!imageBase64 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                  {[
                    { icon: '🌱', label: 'Species ID' },
                    { icon: '🐛', label: 'Pest Info' },
                    { icon: '💧', label: 'Care Tips' },
                    { icon: '📈', label: 'Yield Estimate' },
                  ].map((feature, i) => (
                    <div 
                      key={feature.label}
                      className="glass rounded-xl p-4 text-center animate-fade-up"
                      style={{ animationDelay: `${300 + i * 100}ms` }}
                    >
                      <div className="text-2xl mb-2">{feature.icon}</div>
                      <p className="text-sm font-medium text-foreground">{feature.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                onClick={handleReset}
                className="mb-4"
              >
                ← Analyze Another Plant
              </Button>

              {/* Results */}
              <PlantAnalysisResults data={analysisResult} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by AI for accurate plant identification and agricultural insights
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
