#!/bin/bash

# Generate DKIM keys for email signing
# This script generates a private key and extracts the public key for DNS

SELECTOR="default"
DOMAIN="kabin247.com"
KEY_DIR="./config/dkim"

# Create directory if it doesn't exist
mkdir -p "$KEY_DIR"

# Generate private key (2048 bits)
openssl genrsa -out "$KEY_DIR/${SELECTOR}.private.pem" 2048

# Extract public key
openssl rsa -in "$KEY_DIR/${SELECTOR}.private.pem" -pubout -outform PEM -out "$KEY_DIR/${SELECTOR}.public.pem"

# Extract public key for DNS (remove headers and newlines)
PUBLIC_KEY=$(openssl rsa -in "$KEY_DIR/${SELECTOR}.private.pem" -pubout -outform DER 2>/dev/null | openssl base64 -A)

echo "=========================================="
echo "DKIM Keys Generated Successfully!"
echo "=========================================="
echo ""
echo "Selector: $SELECTOR"
echo "Domain: $DOMAIN"
echo ""
echo "Private Key: $KEY_DIR/${SELECTOR}.private.pem"
echo "Public Key: $KEY_DIR/${SELECTOR}.public.pem"
echo ""
echo "=========================================="
echo "DNS Record to Add (TXT):"
echo "=========================================="
echo ""
echo "Name: ${SELECTOR}._domainkey"
echo "Value: v=DKIM1; k=rsa; p=${PUBLIC_KEY}"
echo ""
echo "=========================================="
echo ""
echo "IMPORTANT:"
echo "1. Add the DNS record above to your DNS provider (GoDaddy)"
echo "2. Keep the private key secure - DO NOT commit it to git"
echo "3. Add $KEY_DIR/*.pem to .gitignore"
echo ""

