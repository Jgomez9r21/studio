'use client';
import React from 'react';
import {Toaster} from "@/components/ui/toaster";

export function Body({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster/>
    </>
  );
}

