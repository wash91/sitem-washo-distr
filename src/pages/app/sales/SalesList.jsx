
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ITEMS_PER_PAGE = 15; 

const FREQUENCY_THRESHOLDS = {
  REGULAR: 7, 
  INFREQUENT: 30, 
};

const getCustomerSaleActivityStatus = (lastSaleDate) => {
  if (!lastSaleDate) return 'inactive';
  const daysSinceLastSale = differenceInDays(new Date(), parseISO(lastSaleDate));
  if (daysSinceLastSale <= FREQUENCY_THRESHOLDS.REGULAR) return 'regular';
  if (daysSinceLastSale <= FREQUENCY_THRESHOLDS.INFREQUENT) return 'infrequent';
  return 'inactive';
};

const CustomerActivityIndicator = ({ customerId, allSales }) => {
  const customerSales = useMemo(() => 
    allSales.filter(s => s.customerId === customerId).sort((a,b) => new Date(b.date) - new Date(a.date))
  , [customerId, allSales]);

  const lastSaleDate = customerSales.length > 0 ? customerSales[0].date : null;
  const status = getCustomerSaleActivityStatus(lastSaleDate);

  const statusConfig = {
    regular: { color: 'bg-green-500', label: 'Cliente Regular (Compra frecuente)' },
    infrequent: { color: 'bg-yellow-500', label: 'Cliente Infrecuente (Compra ocasional)' },
    inactive: { color: 'bg-red-500', label: 'Cliente Inactivo (Sin compras recientes)' },
  };
  
  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className={`inline-block h-3 w-3 rounded-full mr-2 ${config.color} flex-shrink-0`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
          {lastSaleDate && <p className="text-xs">Última compra: hace {differenceInDays(new Date(), parseISO(lastSaleDate))} días</p>}
          {!lastSaleDate && <p className="text-xs">Sin compras registradas</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


const SaleRow = React.memo(({ sale, allProducts, allSales }) => {
    const productDetails = sale.items?.map(item => 
        `${item.quantity}x ${item.productName || allProducts?.find(p => p.id === item.productId)?.name || 'N/A'}`
    ).join(', ') || 'N/A';

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{format(new Date(sale.date), 'dd/MM/yy HH:mm')}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
              <div className="flex items-center">
                <CustomerActivityIndicator customerId={sale.customerId} allSales={allSales} />
                {sale.customerName}
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={productDetails}>{productDetails}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">${sale.totalAmount.toFixed(2)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">{sale.paymentMethod}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{sale.distributorName}</td>
        </tr>
    );
});


const SalesList = ({ sales, allProducts }) => {
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
    const observer = useRef(null);
    const loaderRef = useRef(null);

    useEffect(() => {
        setVisibleItems(ITEMS_PER_PAGE);
    }, [sales]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "20px",
            threshold: 1.0
        };

        const currentLoaderRef = loaderRef.current;

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && visibleItems < sales.length) {
                setVisibleItems(prev => Math.min(prev + ITEMS_PER_PAGE, sales.length));
            }
        }, options);

        if (currentLoaderRef) {
            observer.current.observe(currentLoaderRef);
        }

        return () => {
            if (observer.current && currentLoaderRef) {
                observer.current.unobserve(currentLoaderRef);
            }
        };
    }, [visibleItems, sales.length]);


    if (sales.length === 0) {
        return <p className="text-center py-10 text-gray-500 text-lg">No se encontraron ventas.</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-y-auto h-full custom-scrollbar">
            <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Productos</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Forma Pago</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Distribuidor</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sales.slice(0, visibleItems).map((sale, index) => (
                         <motion.tr
                            key={sale.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                        >
                            <SaleRow sale={sale} allProducts={allProducts} allSales={sales} />
                        </motion.tr>
                    ))}
                </tbody>
            </table>
            {visibleItems < sales.length && (
                <div ref={loaderRef} className="py-4 text-center text-sm text-gray-500">
                    Cargando más ventas...
                </div>
            )}
             {sales.length > 0 && visibleItems >= sales.length && (
                <p className="py-4 text-center text-sm text-gray-400">Fin de la lista.</p>
            )}
        </div>
    );
};
export default SalesList;
