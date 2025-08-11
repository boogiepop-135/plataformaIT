#!/usr/bin/env bash

# Script to update all files to use the new backend configuration

echo "Updating frontend files to use centralized backend configuration..."

# Update TicketSystem.jsx
sed -i 's/const backendUrl = import.meta.env.VITE_BACKEND_URL;//g' src/front/pages/TicketSystem.jsx
sed -i 's/${backendUrl}/${BACKEND_URL}/g' src/front/pages/TicketSystem.jsx

# Update Calendar.jsx  
sed -i 's/const backendUrl = import.meta.env.VITE_BACKEND_URL;//g' src/front/pages/Calendar.jsx
sed -i 's/${backendUrl}/${BACKEND_URL}/g' src/front/pages/Calendar.jsx

# Update KanbanBoard.jsx
sed -i 's/const backendUrl = import.meta.env.VITE_BACKEND_URL;//g' src/front/pages/KanbanBoard.jsx
sed -i 's/${backendUrl}/${BACKEND_URL}/g' src/front/pages/KanbanBoard.jsx

echo "Files updated successfully!"
