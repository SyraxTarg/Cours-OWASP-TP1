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

### 3.1. Injection SQL dans la route `GET /api/exemple/:birthday`
- **Localisation :** `controllers/example.ts`, ligne n°`X` : `db.get('SELECT * FROM exemple WHERE birthday = ${birthday}')`.
- **Preuve de concept :**
  1. Envoyer `GET /api/articles/1 OR 1=1`.
  2. Le serveur renvoie **tout** au lieu d’un seul item.
- **Cause :**
  - Usage de concaténation directe de `req.params.birthday` dans la requête SQL.
- **Remédiation :**
  - Passer à une requête préparée :
    ```ts
    const rawBirthday = req.params.birthday;
    const birthday = validateAndCast(birthday);
    const exemple = await db.get(
      'SELECT * FROM exemple WHERE birthday = ?',
      birthday
    );
    ```
  - Valider que `birthday` soit bien une date au format dd/mm/YYY.

---


### 3.2 Les mots de passe ne sont pas hashés dans la base de données
- **Localisation :** la fonction `register` dans `/backend/src/controllers/auth.ts` et la base de données database.db.
- **Preuve de concept :** Il suffit de copier-coller les credentials de la base de données pour se login.
- **Cause :** Les mots de passe sont enregistrés tels quels dans la base de données.
- **Remédiation :** Utiliser un algorithme de hashage type bcrypt avant d'enregistrer les données dans la base de données.


### 3.3 Les mots de passe faibles sont autorisés
- **Localisation :** la fonction `register` dans `/backend/src/controllers/auth.ts` et la base de données database.db.
- **Preuve de concept :** Le mot de passe de l'utilisateur "bob" dans la base de données est "123456".
- **Cause :** Il n'est à aucune moment demandé un mot de passe fort.
- **Remédiation :** Le front et le back doivent se mettre d'accord sur une liste de caractères à inclure dans le mot de passe, ainsi qu'une longueur. Ca peut être par exemple : au moins 8 caractères, au moins une lettre majuscule, une lettre minuscule, un chiffre et un caratère spécial.



### 3.4. XSS dans la route `GET /articles/edit`

- **Localisation :** `controllers/articles.ts`, ligne n°`42` : fonction modify.
- **Preuve de concept**
Envoyer `</p><img src="x" onError="alert(1)"/><p>` et une alerte va pop.
- **Cause**
Les entrées utilisateurs n'ont pas été chapées et donc on peut y ajouter des balises qui seront interprétées comme tel et non pas comme du simple texte.
- **Remédiation :**
Il faut échapper les entrées utilisateur en utilisant express-validator, en enlevant les caractères spéciaux à la main ou otut simplement en utilisant un orm.


### 3.5. Injection SQL dans la route `GET /articles/`

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
