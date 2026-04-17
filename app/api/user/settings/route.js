// app/api/user/settings/route.js
//
// FIX 4: This route duplicated /api/tenant/settings but wrote to a different
// storage location (user_settings table vs. users.settings column). Pages using
// different endpoints would silently lose each other's settings.
//
// The canonical endpoint is /api/tenant/settings (GET / PATCH).
// This file is kept as a redirect/proxy shim so any existing fetch() calls
// don't hard-404, but all real logic now lives in the canonical route.

import { NextResponse } from 'next/server';

const CANONICAL = '/api/tenant/settings';

// GET → 308 permanent redirect to canonical route (browsers and fetch() follow it)
export async function GET(request) {
  const dest = new URL(CANONICAL, request.url);
  return NextResponse.redirect(dest, { status: 308 });
}

// PUT/PATCH → proxy as PATCH to canonical route.
// 308 preserves the body but cannot change the method, so we forward manually.
async function proxyAsPatch(request) {
  const body = await request.text();
  const dest = new URL(CANONICAL, request.url);
  return fetch(dest.toString(), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') ?? '',
    },
    body,
  });
}

export async function PUT(request)   { return proxyAsPatch(request); }
export async function PATCH(request) { return proxyAsPatch(request); }