
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = React.memo(({ title, value, icon, description, trendValue, trendPeriod }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-semibold text-gray-700">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {trendValue !== undefined && trendValue !== null && (
        <p className={`text-xs flex items-center mt-1 ${trendValue > 0 ? 'text-green-600' : trendValue < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {trendValue > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : trendValue < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <Minus className="h-4 w-4 mr-1" />}
          {trendValue > 0 ? '+' : ''}{trendValue.toFixed(2)}% {trendPeriod}
        </p>
      )}
    </CardContent>
  </Card>
));
