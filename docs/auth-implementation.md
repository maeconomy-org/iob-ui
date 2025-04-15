# Authentication Implementation Guide

## Auth Flow Implementation

### 1. Auth Page (app/page.tsx)

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "authorizing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleAuthorize = async () => {
    setStatus("authorizing");
    setError(null);

    try {
      const response = await fetch("/api/auth/initialize", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Authorization failed");
      }

      setStatus("success");
      sessionStorage.setItem("auth_status", JSON.stringify({
        authenticated: true,
        timestamp: Date.now()
      }));
      router.push("/dashboard");
    } catch (err) {
      setStatus("error");
      setError("Authorization failed. Please ensure you have a valid certificate.");
    }
  };

  return (
    // ... Auth page UI implementation ...
  );
}
```

### 2. Protected Layout (app/layout.tsx)

```typescript
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function checkAuth() {
  const headersList = headers();
  const isAuthenticated = headersList.get("x-auth-status") === "authenticated";
  return isAuthenticated;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuth();
  const isAuthPage = headers().get("x-url")?.endsWith("/");

  if (!isAuthenticated && !isAuthPage) {
    redirect("/");
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Auth Context (contexts/auth.tsx)

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ... Auth context implementation ...
```

## Usage Examples

### In Components

```typescript
import { useAuth } from "@/contexts/auth";

function MyComponent() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <p>Please authenticate</p>
      )}
    </div>
  );
}
```

### In Pages

```typescript
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return <div>Protected Content</div>;
}
```
