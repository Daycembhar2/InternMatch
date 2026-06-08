import { Component, OnInit } from '@angular/core';
import { Offre } from '../Entites/Offre.Entites';
import { Router } from '@angular/router';
import { OffreSearchParams, OffreService } from '../service/offre.service';
import { WOW } from 'wowjs';
import {  OnDestroy } from '@angular/core';
import { CRUDService } from '../service/crud.service';

interface Slide {
  image?: string;
  text: string;
  author?: string;
  isAnimated?: boolean;
  stats?: { value: string; label: string }[];
}

interface TypePhrase {
  word: string;
  sub: string;
  color: string;
}

@Component({
  selector: 'app-etudianthome',
  templateUrl: './etudianthome.component.html',
  styleUrls: ['./etudianthome.component.css']
})
export class EtudianthomeComponent implements OnInit, OnDestroy {

  // ── Slider ────────────────────────────────────────────────
  currentIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly SLIDE_INTERVAL_MS = 3000;

  slides: Slide[] = [
    {
      isAnimated: true,
      text: 'Bienvenue sur InternMatch',
      author: "Trouve ton avenir dès aujourd'hui",
      stats: [
        { value: '150K+', label: 'Offres actives' },
        { value: '50K+',  label: 'Entreprises'   },
        { value: '98%',   label: 'Satisfaction'  }
      ]
    },
    { image: 'assets/images/home/img-02.png', text: "Fais ce que tu aimes et tu ne travailleras jamais", author: '- Marc Anthony' },
    { image: 'assets/images/home/img-03.png', text: '"Le succès vient du travail"',   author: '- Vidal Sassoon'     },
    { image: 'assets/images/home/img-04.png', text: '"Travailler, c\'est réussir"',   author: '- Albert Schweitzer' }
  ];

  // ── Typing animation ──────────────────────────────────────
  readonly phrases: TypePhrase[] = [
    { word: 'Stage PFE',          sub: 'Projet de fin d\'études pour les ingénieurs', color: '#7c3aed' },
    { word: 'Summer Internship',  sub: 'Immersion en entreprise pendant l\'été',      color: '#7c3aed' },
    { word: 'Stage Initiation',   sub: 'Première expérience professionnelle',         color: '#7c3aed' },
    { word: 'Graduation Project', sub: 'Concrétise tes compétences techniques',       color: '#7c3aed' },
    { word: 'Emploi CDI',         sub: 'Plus de 5 000 offres actives en Tunisie',     color: '#7c3aed' },
  ];

  typedText    = '';
  showSubline  = false;
  currentPhrase = 0;
constructor(public router: Router, private offreService: OffreService , private crudService: CRUDService) {}
  get activePhrase(): TypePhrase { return this.phrases[this.currentPhrase]; }

  private typeTimer: ReturnType<typeof setTimeout> | null = null;
  private charIdx   = 0;
  private deleting  = false;
  private pauseCount = 0;
  private readonly PAUSE_TICKS = 32;
  recommandations: any[] = [];
  // ── Filter ────────────────────────────────────────────────
  activeFilter = 'all';
  searchQuery = '';
  activePlan: any = null;
canPost = true;
remainingOffres = 0;
  // ─────────────────────────────────────────────────────────
 ngOnInit(): void {
  this.startAutoPlay();

  this.loadRecommandations();
}

private loadRecommandations(): void {
  const user = this.crudService.userDetails();
  console.log('User pour recommandations :', user);

  if (!user) {
    console.warn('Aucun utilisateur connecté');
    return;
  }

  // Le rôle peut être 'ETUDIANT', 'etudiant', etc.
  const role = (user.role || '').toLowerCase();
  const id = user.id;

  if (!id) {
    console.warn('ID utilisateur introuvable dans le token');
    return;
  }

  this.crudService.getRecommandations(role, id).subscribe({
    next: (data) => {
      console.log('Recommandations reçues :', data);
      this.recommandations = data;
    },
    error: (err) => {
      console.error('Erreur recommandations :', err);
    }
  });
}

  ngOnDestroy(): void {
    this.stopAutoPlay();// arrête le setInterval
    if (this.typeTimer) clearTimeout(this.typeTimer);// arrête l'animation de typing'
  }

  // Démarre le défilement automatique
  private startAutoPlay(): void {
    this.intervalId = setInterval(() => this.nextSlide(), this.SLIDE_INTERVAL_MS);// slide ytbedel kol 3 secondes
  }
  private stopAutoPlay(): void {
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  }
  // Passe au slide suivant
  nextSlide():  void { this.currentIndex = (this.currentIndex + 1) % this.slides.length; }
  prevSlide():  void { this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length; }
  goToSlide(i: number): void { if (i >= 0 && i < this.slides.length) this.currentIndex = i; } //yemchi l slide numéroté direct 
  pauseAutoPlay():  void { this.stopAutoPlay(); }
  resumeAutoPlay(): void { if (this.intervalId === null) this.startAutoPlay(); }

  // Filter
  filterByType(type: string): void {
  this.activeFilter = type;
  if (type === 'all') {
    this.router.navigate(['/listoffres']);
  } else {
    // ← Mapper les noms de boutons vers les vrais types en base
    const typeMap: {[key: string]: string} = {
      'stage':        'STAGE'
    };
    this.router.navigate(['/listoffres'], {
      queryParams: { type: typeMap[type] || type.toUpperCase() }
    });
  }
}

  
  
onSearch(): void {
  const queryParams: any = {};
  if (this.searchQuery?.trim())      queryParams['query'] = this.searchQuery.trim();
  if (this.activeFilter !== 'all')   queryParams['type']  = this.activeFilter;
  this.router.navigate(['/listoffres'], { queryParams });
}
}