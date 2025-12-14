import { 
  Leaf, 
  Bug, 
  Shield, 
  Droplets, 
  Sun, 
  Calendar, 
  TrendingUp,
  Sprout,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlantData {
  plantName?: string;
  scientificName?: string;
  species?: string;
  growthDays?: string;
  description?: string;
  pests?: Array<{ name: string; description: string }>;
  pesticides?: Array<{ name: string; type: string; usage: string }>;
  fertilizers?: Array<{ name: string; type: string; timing: string }>;
  soilRequirements?: { type: string; pH: string; drainage: string };
  seasonInfo?: { 
    bestSeasons: string[]; 
    currentSeasonSuitable: boolean; 
    reason: string 
  };
  yieldEstimate?: { 
    perAcre: string; 
    unit: string; 
    marketPrice: string; 
    notes: string 
  };
  totalYieldEstimate?: {
    acres: number;
    totalYield: string;
    estimatedRevenue: string;
  };
  careInstructions?: string[];
  confidence?: number;
  error?: string;
  rawResponse?: string;
}

interface PlantAnalysisResultsProps {
  data: PlantData;
}

const ResultCard = ({ 
  title, 
  icon: Icon, 
  children, 
  className,
  delay = 0 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <Card 
    className={cn(
      "gradient-card shadow-card hover:shadow-lg transition-all duration-300 animate-fade-up",
      className
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const PlantAnalysisResults = ({ data }: PlantAnalysisResultsProps) => {
  if (data.error || data.rawResponse) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Analysis Issue</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.error || 'Could not parse the analysis results. Please try again.'}
              </p>
              {data.rawResponse && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                  {data.rawResponse.substring(0, 200)}...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidencePercent = data.confidence ? Math.round(data.confidence * 100) : null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="gradient-hero text-primary-foreground overflow-hidden animate-scale-in">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="w-6 h-6" />
                <h2 className="text-2xl sm:text-3xl font-display font-bold">
                  {data.plantName || 'Unknown Plant'}
                </h2>
              </div>
              {data.scientificName && (
                <p className="text-primary-foreground/80 italic text-lg">
                  {data.scientificName}
                </p>
              )}
              {data.species && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {data.species}
                </Badge>
              )}
            </div>
            {confidencePercent !== null && (
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">{confidencePercent}% confidence</span>
              </div>
            )}
          </div>
          {data.description && (
            <p className="mt-4 text-primary-foreground/90 leading-relaxed">
              {data.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Grid of info cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Growth Time */}
        {data.growthDays && (
          <ResultCard title="Growth Period" icon={Calendar} delay={100}>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-display font-bold text-primary">
                {data.growthDays}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Time to reach full maturity
            </p>
          </ResultCard>
        )}

        {/* Season Info */}
        {data.seasonInfo && (
          <ResultCard title="Season Suitability" icon={Sun} delay={150}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {data.seasonInfo.currentSeasonSuitable ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-accent" />
                )}
                <span className={cn(
                  "font-medium",
                  data.seasonInfo.currentSeasonSuitable ? "text-primary" : "text-accent-foreground"
                )}>
                  {data.seasonInfo.currentSeasonSuitable 
                    ? "Good time to plant!" 
                    : "Not ideal season"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{data.seasonInfo.reason}</p>
              <div className="flex flex-wrap gap-2">
                {data.seasonInfo.bestSeasons.map((season, i) => (
                  <Badge key={i} variant="secondary">{season}</Badge>
                ))}
              </div>
            </div>
          </ResultCard>
        )}

        {/* Soil Requirements */}
        {data.soilRequirements && (
          <ResultCard title="Soil Requirements" icon={Sprout} delay={200}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{data.soilRequirements.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">pH Range:</span>
                <span className="font-medium">{data.soilRequirements.pH}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drainage:</span>
                <span className="font-medium">{data.soilRequirements.drainage}</span>
              </div>
            </div>
          </ResultCard>
        )}

        {/* Yield Estimate */}
        {data.yieldEstimate && (
          <ResultCard title="Yield Estimate" icon={TrendingUp} delay={250}>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-display font-bold text-primary">
                  {data.yieldEstimate.perAcre} {data.yieldEstimate.unit}
                </p>
                <p className="text-sm text-muted-foreground">per acre</p>
              </div>
              {data.yieldEstimate.marketPrice && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Market price: </span>
                  <span className="font-medium">{data.yieldEstimate.marketPrice}</span>
                </p>
              )}
              {data.totalYieldEstimate && (
                <div className="p-3 bg-primary/10 rounded-lg mt-3">
                  <p className="text-sm font-medium">
                    For {data.totalYieldEstimate.acres} acres:
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {data.totalYieldEstimate.totalYield}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.totalYieldEstimate.estimatedRevenue}
                  </p>
                </div>
              )}
            </div>
          </ResultCard>
        )}
      </div>

      {/* Pests Section */}
      {data.pests && data.pests.length > 0 && (
        <ResultCard title="Common Pests" icon={Bug} delay={300}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.pests.map((pest, i) => (
              <div key={i} className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="font-medium text-destructive">{pest.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{pest.description}</p>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* Pesticides Section */}
      {data.pesticides && data.pesticides.length > 0 && (
        <ResultCard title="Recommended Pesticides" icon={Shield} delay={350}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.pesticides.map((pesticide, i) => (
              <div key={i} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{pesticide.name}</p>
                  <Badge variant={pesticide.type.toLowerCase() === 'organic' ? 'default' : 'secondary'}>
                    {pesticide.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{pesticide.usage}</p>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* Fertilizers Section */}
      {data.fertilizers && data.fertilizers.length > 0 && (
        <ResultCard title="Recommended Fertilizers" icon={Droplets} delay={400}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.fertilizers.map((fertilizer, i) => (
              <div key={i} className="p-3 bg-leaf-light/30 rounded-lg border border-leaf-light">
                <p className="font-medium">{fertilizer.name}</p>
                <p className="text-sm text-primary">{fertilizer.type}</p>
                <p className="text-sm text-muted-foreground mt-1">{fertilizer.timing}</p>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* Care Instructions */}
      {data.careInstructions && data.careInstructions.length > 0 && (
        <ResultCard title="Care Instructions" icon={Leaf} delay={450}>
          <ul className="space-y-2">
            {data.careInstructions.map((instruction, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{instruction}</span>
              </li>
            ))}
          </ul>
        </ResultCard>
      )}
    </div>
  );
};
