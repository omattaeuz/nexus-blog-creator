#!/usr/bin/env node

/**
 * Script para testar o proxy da Vercel
 * Execute: node test-vercel-proxy.js
 */

const https = require('https');
const http = require('http');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        data: data
      }));
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testProxy() {
  log('\n🚀 Testando Proxy da Vercel + Railway', 'blue');
  log('=====================================', 'blue');
  
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const isLocal = baseUrl.includes('localhost');
  
  log(`\n📍 Testando em: ${baseUrl}`, 'yellow');
  log(`🔧 Modo: ${isLocal ? 'Desenvolvimento' : 'Produção'}`, 'yellow');
  
  try {
    // Teste 1: Preflight OPTIONS
    log('\n1. Testando preflight OPTIONS...', 'yellow');
    
    const preflightResponse = await makeRequest(`${baseUrl}/webhook/posts`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    if (preflightResponse.status === 204) {
      log('✅ Preflight OPTIONS: OK (204)', 'green');
    } else {
      log(`❌ Preflight OPTIONS: FALHOU (${preflightResponse.status})`, 'red');
    }
    
    // Verificar headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers']
    };
    
    Object.entries(corsHeaders).forEach(([header, value]) => {
      if (value) {
        log(`✅ ${header}: ${value}`, 'green');
      } else {
        log(`❌ ${header}: FALTANDO`, 'red');
      }
    });
    
    // Teste 2: Requisição real (se não for local)
    if (!isLocal) {
      log('\n2. Testando requisição real...', 'yellow');
      
      const testData = JSON.stringify({
        title: 'Teste do Proxy',
        content: 'Este é um teste do proxy da Vercel',
        is_public: true
      });
      
      try {
        const realResponse = await makeRequest(`${baseUrl}/webhook/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: testData
        });
        
        log(`📊 Status: ${realResponse.status}`, realResponse.status < 400 ? 'green' : 'red');
        log(`📊 Response: ${realResponse.data.substring(0, 100)}...`, 'blue');
        
      } catch (error) {
        log(`⚠️  Requisição real falhou (esperado se não houver token válido): ${error.message}`, 'yellow');
      }
    } else {
      log('\n2. Pulando requisição real (modo desenvolvimento)', 'yellow');
    }
    
    // Teste 3: Verificar se é proxy ou direto
    log('\n3. Verificando tipo de conexão...', 'yellow');
    
    if (isLocal) {
      log('🔧 Modo Desenvolvimento: Conexão direta com Railway', 'blue');
      log('   - URL: https://primary-production-e91c.up.railway.app/webhook', 'blue');
      log('   - CORS: Gerenciado pelo Railway', 'blue');
    } else {
      log('🚀 Modo Produção: Proxy da Vercel', 'blue');
      log('   - URL: /webhook/* → /api/n8n/* → Railway', 'blue');
      log('   - CORS: Gerenciado pelo proxy', 'blue');
    }
    
    log('\n✅ Teste concluído!', 'green');
    
  } catch (error) {
    log(`\n❌ Erro durante o teste: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Executar teste
testProxy().catch(console.error);
