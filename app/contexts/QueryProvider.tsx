"use client";

import type { ReactNode } from "react";
import {
    QueryClient,
    QueryClientProvider
} from "@tanstack/react-query";

type QueryProviderProps = {
    children: ReactNode;
};

const queryClient = new QueryClient();

export default function QueryProvider({children}: QueryProviderProps){
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

}