"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Bet, BetFormData } from "@/lib/types";
import { BET_CATEGORIES } from "@/lib/types"; // Removed BET_TYPES
import { createBet, updateBet } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const betFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título debe tener al menos 3 caracteres." })
    .max(150),
  // type field removed
  category: z.string().min(2, { message: "La categoría es obligatoria." }),
  stake: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "La cantidad apostada debe ser un número positivo.",
    }),
  odds: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 1, {
      message: "Las cuotas deben ser mayores que 1.",
    }),
});

type BetFormValues = z.infer<typeof betFormSchema>;

interface BetFormProps {
  bet?: Bet; // For editing
  onFormSubmit?: () => void;
}

export default function BetForm({ bet, onFormSubmit }: BetFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState([...BET_CATEGORIES]);

  const form = useForm<BetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: bet
      ? {
          title: bet.title,
          category: bet.category,
          stake: bet.stake.toString(),
          odds: bet.odds.toString(),
        }
      : {
          title: "",
          category: "Fútbol",
          stake: "",
          odds: "",
        },
  });

  async function onSubmit(data: BetFormValues) {
    setIsSubmitting(true);
    const result = bet
      ? await updateBet(bet.id, data as BetFormData)
      : await createBet(data as BetFormData);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Éxito", description: result.success });
      form.reset();
      onFormSubmit?.();
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título / Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Real Madrid gana la Champions, Más de 2.5 goles en Man Utd vs Liverpool"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* FormField for 'type' is removed */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== "Otro") setCustomCategory("");
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.value === "Otro" && (
                <div className="mt-2">
                  <Input
                    placeholder="Escribe la nueva categoría"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    maxLength={30}
                  />
                  <Button
                    type="button"
                    className="mt-2"
                    size="sm"
                    onClick={() => {
                      const trimmed = customCategory.trim();
                      if (trimmed && !categories.includes(trimmed)) {
                        setCategories([
                          ...categories.slice(0, -1),
                          trimmed,
                          "Otro",
                        ]);
                        form.setValue("category", trimmed as any, {
                          shouldValidate: true,
                        });
                        setCustomCategory("");
                      }
                    }}
                    disabled={
                      !customCategory.trim() ||
                      categories.includes(customCategory.trim())
                    }
                  >
                    Añadir categoría
                  </Button>
                </div>
              )}
              {/* Mostrar categorías personalizadas con opción de eliminar */}
              {categories.filter(
                (cat) => !BET_CATEGORIES.includes(cat) && cat !== "Otro"
              ).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories
                    .filter(
                      (cat) => !BET_CATEGORIES.includes(cat) && cat !== "Otro"
                    )
                    .map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center bg-muted px-2 py-1 rounded text-xs"
                      >
                        {cat}
                        <button
                          type="button"
                          className="ml-1 text-destructive hover:text-destructive/80"
                          onClick={() => {
                            setCategories(categories.filter((c) => c !== cat));
                            if (form.getValues("category") === cat) {
                              form.setValue("category", "Otro");
                            }
                          }}
                          aria-label={`Eliminar ${cat}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apostado</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 10.00"
                    {...field}
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="odds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuotas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 1.85"
                    {...field}
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Enviando..."
            : bet
            ? "Actualizar Apuesta"
            : "Añadir Apuesta"}
        </Button>
      </form>
    </Form>
  );
}
