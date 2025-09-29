import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Laugh, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Joke {
  id: number;
  type: string;
  setup: string;
  punchline: string;
}

export function JokeGenerator() {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJoke = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[JOKE GENERATOR] Fetching random joke...');
      const response = await fetch('https://official-joke-api.appspot.com/random_joke', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch joke: ${response.status} ${response.statusText}`);
      }

      const jokeData = await response.json();
      console.log('[JOKE GENERATOR] Received joke:', jokeData);
      
      setJoke(jokeData);
      toast({
        title: "New joke loaded!",
        description: "Enjoy your random joke 😄",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch joke';
      console.error('[JOKE GENERATOR] Error:', errorMessage);
      setError(errorMessage);
      toast({
        title: "Oops!",
        description: "Failed to load a joke. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Laugh className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Random Joke Generator
          </CardTitle>
        </div>
        <CardDescription>
          Click the button below to get a random joke and brighten your day!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {joke && !loading && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="capitalize">
                {joke.type}
              </Badge>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-medium leading-relaxed">
                {joke.setup}
              </p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 leading-relaxed border-l-4 border-blue-500 pl-4">
                {joke.punchline}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error loading joke</span>
            </div>
            <p className="text-red-600 dark:text-red-400 mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Button 
            onClick={fetchJoke} 
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading Joke...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                {joke ? 'Get Another Joke' : 'Get Joke'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}