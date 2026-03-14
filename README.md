# utilisateur-avec-react-vite-et-django-et-postgresql-otp
git clone
cd frontend
frontend:
npm install
npm run dev
------------------

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
------------------
bd dans le setting
note ici pas de .env pour les 2
     fonctionne directement en local