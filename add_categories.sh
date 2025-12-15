#!/bin/bash
# This script will help identify which items need categories added
grep -n "id: '" src/data/items/consumables.ts | head -20
