# ♻️ RecycleHub - Application de Gestion du Recyclage

## 📌 Contexte du Projet
RecycleHub est une application permettant de mettre en relation des particuliers et des collecteurs agréés pour la gestion du recyclage. L'application est développée en **Angular 17+** sous forme de **Single Page Application (SPA)**.

---

## 🚀 Fonctionnalités Principales

### 🔐 Inscription/Connexion
- 📧 **Email et mot de passe**
- 👤 **Nom et prénom**
- 🏡 **Adresse complète**
- 📞 **Numéro de téléphone**
- 🎂 **Date de naissance**
- 🖼️ **Photo de profil (optionnel)**
- 🔄 **Modification/Suppression du compte**

### 🗑️ Demande de Collecte
- ♻️ **Type de déchet** : Plastique, Verre, Papier, Métal
- 📷 **Photos des déchets (optionnel)**
- ⚖️ **Poids estimé** (minimum **1000g**)
- 📍 **Adresse de collecte**
- 📅 **Date et créneau horaire (09h00 - 18h00)**
- ✍️ **Notes supplémentaires (optionnel)**
- 📋 **Statut par défaut : En attente**
- 🔄 **Modification/Suppression d'une demande "en attente"**
- 🔢 **Maximum de 3 demandes simultanées non validées/rejetées**
- 🔝 **Limite totale des collectes : 10kg**

### 🚛 Processus de Collecte
- 📋 **Statuts possibles :**
  - 🟡 En attente
  - 🟠 Occupée
  - 🔵 En cours
  - ✅ Validée
  - ❌ Rejetée
- 📌 **Accès limité aux demandes de la même ville**
- 🔍 **Vérification des matériaux**
- ⚖️ **Validation du poids réel**
- 📷 **Photos optionnelles**
- ✅ ❌ **Validation ou rejet de la collecte**

### 🎯 Système de Points
- 🟢 **Plastique** : 2 points/kg
- 🔵 **Verre** : 1 point/kg
- 📜 **Papier** : 1 point/kg
- 🟠 **Métal** : 5 points/kg
- 💰 **Conversion des points** en bons d'achat :
  - 🎟️ **100 points = 50 Dh**
  - 🎟️ **200 points = 120 Dh**
  - 🎟️ **500 points = 350 Dh**

---

## 🛠️ Technologies Utilisées
- ⚡ **Angular 17+** (Module ou Standalone)
- 🔄 **Gestion d'état avec NgRx**
- ⏳ **RxJS / Observables**
- 🏗️ **Injection de dépendances**
- 📝 **Formulaires (Reactive Forms / Template Driven Forms)**
- 🎨 **Bootstrap / Tailwind CSS**
- 🔐 **Guards, Resolvers**
- 🔗 **Routing, Services, Pipes, Components Parent/Enfant**
- 💾 **Persistance des données (au choix)**
- ⚠️ **Validation des données et gestion des erreurs**
- 📱 **Design responsive**

---

---

🚀 **RecycleHub - Recyclons intelligemment pour un monde plus vert ! 🌍**