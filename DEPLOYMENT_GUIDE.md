# 🚀 Deployment Guide - Weather App

**Last Updated**: November 17, 2026

This guide helps you deploy the Weather App to Railway or Render.

---

## 📊 Deployment Options

| Option | Cost | Setup Time | Best For |
|--------|------|-----------|----------|
| **Railway** | $5 free/month | 5 min | Better free tier, recommended |
| **Render** | Free (limited) | 5 min | Learning, small projects |
| **Both** | Mix | 10 min | Maximum flexibility |

---

## 🚂 Option 1: Deploy to Railway (RECOMMENDED)

### Prerequisites
- GitHub account (app will be in your GitHub!)
- Railway account (free to sign up)

### Step-by-Step

#### 1️⃣ **Push Code to GitHub**

```bash
# Clone the existing repository
git clone https://github.com/PrudhviRaavi/Weather-app.git
cd Weather-app
```

#### 2️⃣ **Connect to Railway**

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub"**
4. Choose your `weather-app` repository
5. Railway will use the repository configuration

#### 3️⃣ **Configure Environment Variables**

> ⚠️ Never paste real credentials into documentation or commit them to Git. If credentials were previously exposed, revoke them with the provider and generate replacements before deploying.

On Railway dashboard:
- Click your project
- Go to **Variables**
- Add these environment variables:

```
API_KEY = your_openweathermap_api_key_here
DATABASE_URL = mysql://root:your_password@your-mysql-host:3306/weather_db
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_password_here
JWT_SECRET_KEY = your_strong_random_secret_key_here
NODE_ENV = production
PORT = 5000
```

#### 4️⃣ **Deploy Backend**

1. Click **"Add Service"** → **"From Repo"**
2. Select `weather-app` again
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
4. Railway will auto-deploy!

#### 5️⃣ **Deploy Frontend**

1. Click **"Add Service"** → **"From Repo"**
2. Select `weather-app` again
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port 3000`
4. Add environment variable:
   ```
   VITE_API_URL = https://your-backend-domain.railway.app/api
   ```
5. Deploy!

#### 6️⃣ **Get Your URLs**

- Backend: `https://weather-app-backend-randomid.railway.app`
- Frontend: `https://weather-app-frontend-randomid.railway.app`

✅ **Your app is live!**

---

## 🎨 Option 2: Deploy to Render

### Prerequisites
- GitHub account
- Render account (free)

### Step-by-Step

#### 1️⃣ **Use the GitHub repository**

```bash
git clone https://github.com/PrudhviRaavi/Weather-app.git
cd Weather-app
```

#### 2️⃣ **Deploy Backend to Render**

1. Go to: https://render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Build and deploy from Git"**
4. Choose your GitHub repo
5. Configure:
   - **Name**: `weather-app-backend`
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npx prisma migrate deploy && npm start`
   - **Runtime**: `Node`
6. Under **"Advanced"** → Add environment variables:
   ```
   API_KEY = your_openweathermap_api_key_here
   DATABASE_URL = mysql://root:your_password@your-mysql-host:3306/weather_db
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASS = your_gmail_app_password_here
   JWT_SECRET_KEY = your_strong_random_secret_key_here
   NODE_ENV = production
   ```
7. Click **"Create Web Service"**

#### 3️⃣ **Deploy Frontend to Render**

1. Click **"New +"** → **"Web Service"**
2. Same repository
3. Configure:
   - **Name**: `weather-app-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm run preview -- --host 0.0.0.0 --port 3000`
4. Environment variables:
   ```
   VITE_API_URL = https://weather-app-backend-xxx.onrender.com/api
   ```
5. Click **"Create Web Service"**

#### 4️⃣ **Get Your URLs**

- Backend: `https://weather-app-backend-xxx.onrender.com`
- Frontend: `https://weather-app-frontend-xxx.onrender.com`

✅ **Your app is live!**

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Visit frontend URL in browser
- [ ] Search for a city (e.g., London)
- [ ] Verify real weather data displays
- [ ] Check forecast data
- [ ] Test air quality page
- [ ] Click through alerts page
- [ ] Try the weather map
- [ ] Verify no console errors

---

## 🔧 Troubleshooting

### "App won't start"
- Check the **Logs** on Railway/Render
- Verify all environment variables are set
- Make sure `npm install` completes

### "Cannot connect to backend"
- Check backend URL in frontend `.env`
- Verify backend deployment was successful
- Check CORS settings in backend

### "Email not sending"
- Verify `EMAIL_PASS` is a valid Gmail app password
- Check backend logs for email errors

### "Map not showing"
- Leaflet CSS might not be loading
- Check browser console for errors
- Verify OpenStreetMap tiles are accessible

---

## 📱 After Deployment

Your app is now live on the internet!

**Share with friends**:
- Backend: `https://weather-app-backend-xxx.onrender.com/api/weather/city/London`
- Frontend: `https://weather-app-frontend-xxx.onrender.com`

**Monitor**:
- Check logs regularly for errors
- Monitor performance on provider dashboard
- Respond to user issues

**Next Steps**:
- Add custom domain (optional)
- Set up alerts/monitoring
- Add CI/CD pipeline for auto-deployment
- Consider upgrading to paid tier if needed

---

## 💰 Cost Breakdown

**Railway**:
- Free: $5/month credit
- Then: $0.000463/CPU hour (very cheap)
- **Total**: ~$5-10/month
---

## 🎯 Next Optimization Steps

1. **Database Backup**
   - Configure automated MySQL backups
   - Store in cloud (AWS S3, Google Cloud)

2. **Monitoring**
   - Add error tracking (Sentry)
   - Add performance monitoring (New Relic)

3. **SSL Certificate**
   - Railway/Render provide free HTTPS ✅
   - Custom domain? Add SSL for free ✅

4. **Custom Domain**
   - Buy domain (GoDaddy, Namecheap)
   - Point to Railway/Render
   - Cost: $10-15/year

---

## 📞 Support

**Questions?** Check the docs:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Or ask me! 🚀
