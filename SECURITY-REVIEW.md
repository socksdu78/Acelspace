# Rapport d’audit de sécurité

Audit statique du code du dépôt, réalisé le 22 novembre 2026. Aucun test réseau ni test d’exploitation n’a été effectué.

## Constats

| # | Gravité | Fichier et lignes | Constat | Confiance |
|---|---|---|---|---|
| 1 | Élevée | [`backend/server.js`](./backend/server.js), lignes 554–560 et 992–994 | Des notifications ntfy.sh sont envoyées à des topics sans authentification. La notification de précommande inclut des données personnelles du parent et de l’enfant, ainsi que le montant. Si le topic est accessible publiquement, un tiers qui le connaît peut recevoir ces données. | 9/10 |
| 2 | Moyenne | [`backend/server.js`](./backend/server.js), lignes 58, 64, 811–834 et 1005 | Des noms fournis par le visiteur sont insérés sans échappement dans le HTML de l’e-mail de confirmation. Le visiteur choisit également l’adresse destinataire. Cela peut permettre une injection HTML dans un e-mail envoyé au visiteur ou à un tiers. | 9/10 |

## Recommandations

1. Ne pas publier de données personnelles sur un topic public : supprimer ces notifications ou utiliser un topic privé avec authentification et contrôle d’accès.
2. Échapper les valeurs utilisateur insérées dans les e-mails HTML et vérifier l’adresse destinataire avant envoi.

## Vérifications de déploiement à effectuer

- Vérifier que `ADMIN_PASSWORD_HASH` n’utilise pas le mot de passe par défaut signalé dans `README.md` (lignes 30 et 47).
- Vérifier que la configuration du proxy correspond à `trust proxy = 1`.
- Le fichier `.env` et les bases de données locales ignorées par Git n’ont pas été examinés.
