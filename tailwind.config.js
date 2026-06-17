/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // هنجهز الألوان بتاعة ديزاينك من دلوقتي عشان نستخدمها عل طول
        cityDark: '#04332D', // الأخضر الغامق الرايق بتاع الزرار واللوجو
        cityBg: '#F4F7F6',   // الخلفية المايلة للرمادي الهادي
      }
    },
  },
  plugins: [],
}