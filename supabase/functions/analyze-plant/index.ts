import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, acres } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing plant image...');

    const systemPrompt = `You are an expert botanist and agricultural scientist. Analyze the plant image and provide detailed information in the following JSON format. Be accurate and helpful.

Return ONLY valid JSON with this exact structure:
{
  "plantName": "Common name of the plant",
  "scientificName": "Scientific/botanical name",
  "species": "Species type and family",
  "growthDays": "Number of days to fully mature (e.g., '90-120 days')",
  "description": "Brief description of the plant",
  "pests": [
    {
      "name": "Pest name",
      "description": "Brief description of damage caused"
    }
  ],
  "pesticides": [
    {
      "name": "Pesticide name",
      "type": "Organic/Chemical",
      "usage": "How to apply"
    }
  ],
  "fertilizers": [
    {
      "name": "Fertilizer name",
      "type": "Type (e.g., NPK ratio)",
      "timing": "When to apply"
    }
  ],
  "soilRequirements": {
    "type": "Soil type (e.g., Loamy, Sandy)",
    "pH": "Optimal pH range",
    "drainage": "Drainage requirements"
  },
  "seasonInfo": {
    "bestSeasons": ["Season1", "Season2"],
    "currentSeasonSuitable": true/false,
    "reason": "Why it is or isn't suitable now"
  },
  "yieldEstimate": {
    "perAcre": "Expected yield per acre",
    "unit": "Unit of measurement",
    "marketPrice": "Approximate market price per unit",
    "notes": "Additional yield notes"
  },
  "careInstructions": [
    "Care instruction 1",
    "Care instruction 2"
  ],
  "confidence": 0.0 to 1.0
}

If you cannot identify the plant clearly, still provide your best guess with a lower confidence score. Current date for seasonal analysis: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this plant image and provide detailed agricultural information. ${acres ? `The farmer has ${acres} acres of land for cultivation.` : ''}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please check your account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze plant' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response received');

    // Try to parse JSON from the response
    let plantData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      plantData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return the raw content if parsing fails
      plantData = { rawResponse: content, error: 'Could not parse structured data' };
    }

    // Calculate yield if acres provided
    if (acres && plantData.yieldEstimate) {
      const yieldPerAcre = parseFloat(plantData.yieldEstimate.perAcre) || 0;
      plantData.totalYieldEstimate = {
        acres: acres,
        totalYield: `${(yieldPerAcre * acres).toFixed(2)} ${plantData.yieldEstimate.unit || 'units'}`,
        estimatedRevenue: plantData.yieldEstimate.marketPrice 
          ? `Based on ${plantData.yieldEstimate.marketPrice} per ${plantData.yieldEstimate.unit}`
          : 'Contact local markets for current prices'
      };
    }

    return new Response(
      JSON.stringify(plantData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing plant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
