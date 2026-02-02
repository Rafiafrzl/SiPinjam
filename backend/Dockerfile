# Menggunakan Node.js versi terbaru
FROM node:20

# Membuat direktori kerja di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Menyalin seluruh kode backend
COPY . .

# Hugging Face Spaces mewajibkan aplikasi berjalan di port 7860
ENV PORT=7860
EXPOSE 7860

# Jalankan server
CMD ["node", "server.js"]
