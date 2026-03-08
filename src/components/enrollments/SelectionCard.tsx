"use client";

import { CheckCircle } from "lucide-react";
import * as React from "react";

interface SelectionCardProps {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    imagem?: string | null;
    isSelected: boolean;
    onClick: () => void;
    details?: React.ReactNode;
}

export function SelectionCard({
    title,
    subtitle,
    icon: Icon,
    isSelected,
    imagem,
    onClick,
    details,
}: SelectionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full p-5 text-left transition-all duration-200 rounded-xl shadow-md
                border-2 ${isSelected
                    ? "border-primary bg-primary/5 shadow-lg scale-[1.01]"
                    : "border-gray-200 bg-white hover:shadow-lg"
                }
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {imagem ? (
                        <img
                            src={imagem}
                            alt={title}
                            className="w-[48px] h-[48px] object-cover rounded-full"
                        />
                    ) : (
                        <div className={`
                        p-3 rounded-full transition-colors 
                        ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}
                        `}>

                            <Icon className="w-6 h-6" />
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {isSelected && (
                    <CheckCircle className="w-6 h-6 text-primary animate-in fade-in" />
                )}
            </div>

            {details && (
                <div className={`
                    mt-3 pt-3 border-t ${isSelected ? 'border-primary/20' : 'border-gray-100'}
                    text-xs text-gray-600 space-y-1
                `}>
                    {details}
                </div>
            )}
        </button>
    );
}