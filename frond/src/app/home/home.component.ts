import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategorieSecteur, OffreService } from '../service/offre.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  categoriesSecteur: CategorieSecteur[] = [];
  recentOffres: any[] = [];        // ✅ Ajouté
  isLoadingOffres = true;          // ✅ Ajouté
  activeTypeFilter = '';       // Appelé lors du clic sur un type de filtre (stage, pfe, emploi)
isLoadingCategories = true;
  readonly iconeMap: Record<string, string> = {
    'IT/Software':              'uim uim-layers-alt',
    'Technology':               'uim uim-airplay',
    'Covernment':               'uim uim-bag',
    'Accounting/Finance':       'uim uim-scenery',
    'Constructions/Facilities': 'uim uim-briefcase',
    'Tele-Communications':      'uim uim-clock',
  };

  getIcone(type: string): string {
    return this.iconeMap[type] ?? 'uim uim-briefcase';
  }

  searchQuery      = '';
  selectedLocation = '';
  activeFilter     = 'all';
  isSearching      = false;

  currentIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly SLIDE_INTERVAL_MS = 3000;

  slides = [
    {
      isAnimated: true,
      text: 'Bienvenue sur InternMatch',
      author: "Trouve ton avenir dès aujourd'hui",
      stats: [
        { value: '150K+', label: 'Offres actives' },
        { value: '50K+',  label: 'Entreprises'   },
        { value: '98%',   label: 'Satisfaction'   }
      ]
    },
    { image: 'assets/images/home/img-02.png', text: 'Fais ce que tu aimes', author: '- Marc Anthony' },
    { image: 'assets/images/home/img-03.png', text: '" Le succès vient du travail "', author: '- Vidal Sassoon' },
    { image: 'assets/images/home/img-04.png', text: '" Travailler, c\'est réussir "', author: '- Albert Schweitzer' }
  ];

  constructor(
    private offreService: OffreService,
    public router: Router
  ) {}

setTypeFilter(type: string): void {// Appelé lors du clic sur un type de filtre (stage, pfe, emploi)
  this.activeTypeFilter = type;
}
getCountForFilter(cat: CategorieSecteur): number {
  if (this.activeTypeFilter === 'stage')  return cat.stages;
  if (this.activeTypeFilter === 'pfe')    return cat.pfe;
  if (this.activeTypeFilter === 'emploi') return cat.emploi;
  return cat.total;
}

// Navigation vers /listoffres avec secteur + type
navigateToSecteur(secteur: string): void {
  const params: any = { secteur };
  if (this.activeTypeFilter) params['type'] = this.activeTypeFilter;
  this.router.navigate(['/listoffres'], { queryParams: params });
}
  ngOnInit(): void {
    this.startAutoPlay();

    // Chargement catégories
    this.offreService.getCategoriesSecteur().subscribe({
  next: data => {
    this.categoriesSecteur = data;
    this.isLoadingCategories = false;
  },
  error: err => {
    console.error('Erreur catégories secteur:', err);
    this.isLoadingCategories = false;
  }
});

    //  Chargement des offres récentes (max 6)
    this.offreService.getAllOffres().subscribe({
      next: (data) => {
        // Trier par date de publication décroissante, prendre les 6 premières
        this.recentOffres = data
          .sort((a, b) => {
            const dateA = a.datePublication ? new Date(a.datePublication).getTime() : 0;
            const dateB = b.datePublication ? new Date(b.datePublication).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 6);
        this.isLoadingOffres = false;
      },
      error: (err) => {
        console.error('Erreur offres récentes:', err);
        this.isLoadingOffres = false;
      }
    });
  }

  ngOnDestroy(): void { this.stopAutoPlay(); }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => this.nextSlide(), this.SLIDE_INTERVAL_MS);
  }

  private stopAutoPlay(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) this.currentIndex = index;
  }

  filterByType(type: string): void { this.activeFilter = type; }// Appelé lors du clic sur un type de filtre (stage, pfe, emploi)

  onSearch(): void {// Construire les queryParams pour la recherche
    this.isSearching = true;
    const queryParams: any = {};
    if (this.searchQuery?.trim())      queryParams['query']       = this.searchQuery.trim();
    if (this.selectedLocation?.trim()) queryParams['localisation'] = this.selectedLocation.trim();
    if (this.activeFilter !== 'all')   queryParams['type']        = this.activeFilter;
    this.isSearching = false;
    this.router.navigate(['/listoffres'], { queryParams });
  }

  // Naviguer vers la liste avec filtre de type
  filterOffres(type: string): void {
    this.router.navigate(['/listoffres'], {
      queryParams: type ? { type } : {}
    });
  }

  // ✅ Postuler depuis la home
  goToPostulation(offreId: number): void {
    this.router.navigate(['/postulation', offreId]);
  }
}