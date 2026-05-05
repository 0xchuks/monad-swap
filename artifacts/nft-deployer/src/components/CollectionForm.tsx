import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  symbol: z.string().min(1, "Symbol is required").max(8, "Symbol max 8 chars").regex(/^[a-zA-Z0-9]+$/, "Alphanumeric only"),
  maxSupply: z.coerce.number().int().min(1, "Must be at least 1").max(1000000000, "Supply too large"),
  mintPrice: z.coerce.number().min(0, "Cannot be negative"),
  description: z.string().max(1000, "Description too long").optional(),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  initialValues: Partial<CollectionFormValues>;
  onNext: (values: CollectionFormValues) => void;
  onBack: () => void;
}

export function CollectionForm({ initialValues, onNext, onBack }: CollectionFormProps) {
  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: initialValues.name || "",
      symbol: initialValues.symbol || "",
      maxSupply: initialValues.maxSupply || 10000,
      mintPrice: initialValues.mintPrice || 0.05,
      description: initialValues.description || "",
    },
  });

  function onSubmit(data: CollectionFormValues) {
    onNext(data);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Collection Details</h2>
        <p className="text-muted-foreground">
          Define the fundamental properties of your ERC-721 contract.
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. My Cool NFTs" {...field} data-testid="input-collection-name" />
                      </FormControl>
                      <FormDescription>The full name of your collection.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MCN" {...field} data-testid="input-collection-symbol" />
                      </FormControl>
                      <FormDescription>A short ticker (max 8 chars).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Supply</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000" {...field} data-testid="input-collection-supply" />
                      </FormControl>
                      <FormDescription>Maximum number of NFTs that can be minted.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mintPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mint Price (ETH)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="0.05" {...field} data-testid="input-collection-price" />
                      </FormControl>
                      <FormDescription>Price per NFT in ETH.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your collection..." 
                        className="resize-none min-h-[100px]"
                        {...field} 
                        data-testid="input-collection-desc"
                      />
                    </FormControl>
                    <FormDescription>Optional description for marketplaces like OpenSea.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onBack} data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" className="gap-2" data-testid="button-next-step">
                  Continue to Artwork <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}