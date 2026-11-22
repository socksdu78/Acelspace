import Alpine from 'alpinejs';

Alpine.data('printApp', () => ({
    loading: true,
    error: null,
    persons: [],
    totalPersons: 0,
    grandTotalAmount: 0,
    printDate: '',

    async loadData() {
        try {
            const res = await fetch('/api/admin/print-data', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (res.status === 401) {
                this.error = {
                    is401: true,
                    title: 'Authentification requise',
                    message: 'Session expirée, reconnecte-toi'
                };
                return;
            }

            if (!res.ok) {
                const errorDetail = await res.text().catch(() => '');
                console.error(`[Admin Print] Erreur HTTP ${res.status} (${res.statusText}):`, errorDetail);
                this.error = {
                    is401: false,
                    title: `Erreur HTTP ${res.status}`,
                    message: `Erreur ${res.status} (${res.statusText || 'Erreur serveur'}) lors de la récupération des données.`
                };
                return;
            }

            const json = await res.json();
            if (!json || !json.success || !json.data) {
                console.error('[Admin Print] Format de données JSON inattendu:', json);
                this.error = {
                    is401: false,
                    title: 'Données invalides',
                    message: json && json.message ? json.message : 'Format de réponse invalide reçu du serveur.'
                };
                return;
            }

            this.persons = json.data.persons || [];
            this.totalPersons = json.data.totalPersons || 0;
            this.grandTotalAmount = json.data.grandTotalAmount || 0;
            this.printDate = json.data.printDate || new Date().toLocaleString('fr-FR');

            this.$nextTick(() => {
                setTimeout(() => {
                    window.print();
                }, 400);
            });
        } catch (err) {
            console.error('[Admin Print] Erreur réseau ou exception critique:', err);
            this.error = {
                is401: false,
                title: 'Erreur réseau',
                message: `Impossible de contacter le serveur (${err.message || 'Erreur inconnue'})`
            };
        } finally {
            this.loading = false;
        }
    },

    triggerPrint() {
        window.print();
    }
}));

Alpine.start();
