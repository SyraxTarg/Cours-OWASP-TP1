# TP - Rapport de Recherche de Vulnérabilités et Remédiations

## 1. Informations Générales

- **Saint-Marc Maimiti / Sbaffe Claire :**
- **Date : 06-06-2025**

---

## 2. Méthodologie

- **Analyse statique :**
  - Lecture rapide du code backend (TypeScript) et frontend (Vue).
  - Repérage des zones sensibles (concatenation SQL, routes sans validation, gestion des sessions, etc.).
  - ...
- **Tests dynamiques :**
  - Requêtes manuelles avec cURL / Postman / navigateur / Burp Suite.
  - Tentatives d’injection (SQL, paramètre URL, ...) avec quels outils (ex: sqlmap)
  - Contrôle d'accès avec simulation de rôles (admin vs user).
  - Vérification des en-têtes (cookies, CORS).
  - ...

---

## 3. Vulnérabilités Identifiées

### 3.1 Les mots de passe ne sont pas hashés dans la base de données

- **Localisation :** la fonction `register` dans `/backend/src/controllers/auth.ts` et la base de données database.db.
- **Preuve de concept :** Il suffit de copier-coller les credentials de la base de données pour se login.
- **Cause :** Les mots de passe sont enregistrés tels quels dans la base de données.
- **Remédiation :** Utiliser un algorithme de hashage type bcrypt avant d'enregistrer les données dans la base de données.

### 3.2 Les mots de passe faibles sont autorisés

- **Localisation :** la fonction `register` dans `/backend/src/controllers/auth.ts` et la base de données database.db.
- **Preuve de concept :** Le mot de passe de l'utilisateur "bob" dans la base de données est "123456".
- **Cause :** Il n'est à aucune moment demandé un mot de passe fort.
- **Remédiation :** Le front et le back doivent se mettre d'accord sur une liste de caractères à inclure dans le mot de passe, ainsi qu'une longueur. Ca peut être par exemple : au moins 8 caractères, au moins une lettre majuscule, une lettre minuscule, un chiffre et un caratère spécial.

### 3.3. XSS dans la route `GET /articles/edit`

- **Localisation :** `controllers/articles.ts`, ligne n°`42` : fonction modify.
- **Preuve de concept**
  Envoyer `</p><img src="x" onError="alert(1)"/><p>` et une alerte va pop.
- **Cause**
  Les entrées utilisateurs n'ont pas été chapées et donc on peut y ajouter des balises qui seront interprétées comme tel et non pas comme du simple texte.
- **Remédiation :**
  Il faut échapper les entrées utilisateur en utilisant express-validator, en enlevant les caractères spéciaux à la main ou otut simplement en utilisant un orm.

### 3.4. Injection SQL dans la route `GET /articles/`

- **Localisation :** `controllers/articles.ts`, ligne n°`33` : fonction get.
- **Preuve de concept**
Envoyer `/api/articles/' or1=1 --` à la place de l'id attendu pour que tous soient retournés.
- **Cause**
  En fait, dans le code on fait un db.get donc il n'y aura qu'un article qui sera retourné. Or, en mettant cette injection dans l'url on voit qu'un article est quand meme retourné alors que dans le cas ou un article n'existe pas on tombre sur un "loading ...", ce qui veut dire que l'injection à réussi. Si on remplace le db.get par un db.all on voir que tous les articles ont été retournés. La requête sql n'est pas préparée.
- **Remédiation :**
  Il faut préparer la requête en faisant quelque chose comme :

```javascipt
(`SELECT * FROM articles WHERE id=? AND authorId=?`, articleId, authorId)
```

### 3.5 Le login indique si c'est le username ou le password qui est faux (trop explicite)

- **Localisation :** La fonction `login` dans `/backend/src/controllers/auth.ts`.
- **Preuve de concept :** Quand j'entre "bobi" et "123456" dans le formulaire de login, je reçois l'erreur "User not exist, mais quand j'entre "bob" et "1234567", je reçois "Invalid password"
- **Cause :** On vérifie séparément la correspondance avec le username et la correspondance avec le mot de passe, et 2 erreurs différentes sont renvoyées.
- **Remédiation :** fetch le username et le password en même temps comme ça on ne sait pas lequel ne correspond pas :

```javascript
const user = await db.get(
  `SELECT * FROM users WHERE username = ? AND password = ?`,
  username,
  password
);
if (!user) return res.status(401).json({ error: "Invalid credentials." });
```

### 3.6 Broken Access Control dans l'api

- **Localisation :** La fonction `authMiddleware` dans `/backend/src/middlewares/auth.ts`.
- **Preuve de concept :** Connectée en tant qu'utilisateur bob (id: 2) j'ai pu modifier un article qui ne m'appartient pas, l'article 4.
- **Cause :** Le auth middle ware vérifie seulement si l'utilisateur est connecté peu importe s'il s'agit de mon article ou non.
- **Remédiation :** il faut changer le middleware ou carrément en faire un autre qui vérifie l'identité de l'utilisateur connecté et eventuellement faire une double vérification dans les fonctions d'action.

### 3.7 Le mot de passe du user connecté est visible en clair depuis le navigateur

- **Localisation :** La fonction `me` dans `/backend/src/controllers/auth.ts`.
- **Preuve de concept :** J'ai installé l'extension Vue DevTools sur mon navigateur, j'ai cherché dans la navbar (parce qu'elle a forcément un objet user puisqu'il y a son username). J'ai trouvé l'objet entier en clair. Ce qui veut dire que si bob quitte son poste sans verrouiller son PC, n'importe qui peur faire cette manipulation et trouver son mot de passe en clair.
```
user : Object (Ref)
  id : 2
  password : 123456
  role : user
  username : bob
```
- **Cause :** Toutes les données du user sont récupérées lors de la requête dans la fonction `me`. Cela s'additionne avec le 3.1 : le mot de passe n'est pas hashé (mais c'est encore un autre problème). Le mot de passe n'est pas utile à l'utilisateur, puisqu'il le connait déjà, c'est même sa façon de prouver qu'il est bien qui il prétend être.
- **Remédiation :** Il ne faut retourner que les informations indispensables lors de la requête SQL. Dans notre cas, id, username et role suffisent amplement. Il est inutile voire dangereux de renvoyer aussi le mot de passe, d'autant plus en clair.
```javascript
const user = await db.get(`SELECT id, username, role FROM users WHERE id = ?`, userId);
```

### 3.8 Blind SSRF (server-side request forgery)

- **Localisation :** La fonction `export` dans `/backend/src/controllers/articles.ts`.
- **Preuve de concept :** La fonction d'export envoie mes articles sous forme de json à n'importe quelle addresse sans la vérifier
- **Cause :** L'addresse donnée par l'utilisateur n'est pas vérifiée donc je peux mettre n'importe quelle addressse malveillante et leur donner une porte d'entrée à mon serveur. Je ne limite pas non plus le nombre de requetes envoyées je peux donc me rendre complice d'un DOS vers un autre dite. Enfin, vu que mon fetch est un POST ça va causer des problèmes si je mets une addresse interne à mon serveur, des actions pourront être déclenchées sans que je ne le sache.
- **Remédiation :** Il faut vérifier l'url donnée en mettant en place un whitelist et blacklist des url. Il faudrait aussi limiter le nombre de requêtes envoyées en une seconde par exemple.

