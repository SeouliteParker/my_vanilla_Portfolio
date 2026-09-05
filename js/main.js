
// GitHub 사용자 계정명
const GITHUB_USERNAME = 'SeouliteParker';

// DOM 요소 캐싱
const header = document.querySelector('#header');
const navMenu = document.querySelector('#nav-menu');
const hamburgerBtn = document.querySelector('#hamburger-btn');
const themeToggleBtn = document.querySelector('#theme-toggle');
const scrollTopBtn = document.querySelector('#scroll-top-btn');
const projectsContainer = document.querySelector('#projects-container');
const contactForm = document.querySelector('#contact-form');
const navLinks = document.querySelectorAll('.nav-link');

// 1. 다크 모드 초기화 및 제어 (상태 -> 렌더링)
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', initialTheme);
};

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem('theme', targetTheme);
});

// 2. 햄버거 메뉴 토글 (모바일 인터랙션)
hamburgerBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// 3. 스크롤 위치 기반 UI 반응
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // 네비게이션 스타일 변경 임계값: 60px
  if (scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // 최상단 이동 버튼 노출 임계값: 300px
  if (scrollY > 300) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 4. 스크롤 애니메이션 (Intersection Observer 임계값: 0.2)
const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
};

const sectionObserver = new IntersectionObserver(observerCallback, {
  threshold: 0.2
});

document.querySelectorAll('.observer-target').forEach((section) => {
  sectionObserver.observe(section);
});

// 5. 프로젝트 목록 (로컬 이미지 데이터 결합)
const localProjects = [
  {
    name: 'Codyssey Study',
    description: '협업 및 학습 기록 관리를 위한 스터디 플랫폼 프로젝트입니다.',
    html_url: 'https://github.com/SeouliteParker',
    image: 'images/Codyssey%20Study.png',
    language: 'JavaScript',
    stargazers_count: 0
  },
  {
    name: 'Team GaussX',
    description: '팀 협업 및 데이터 분석·시각화 환경을 구축한 프로젝트입니다.',
    html_url: 'https://github.com/SeouliteParker',
    image: 'images/Team%20GaussX.png',
    language: 'JavaScript',
    stargazers_count: 0
  }
];

const renderProjects = (projects) => {
  projectsContainer.innerHTML = projects
    .map(({ name, description, html_url, stargazers_count, language, image }) => `
      <article class="project-card">
        ${image ? `
          <div class="project-img-wrap" style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 12px;">
            <img src="${image}" alt="${name} 썸네일" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        ` : ''}
        <div>
          <h3 class="project-title">${name}</h3>
          <p class="project-desc">${description || '저장소 설명이 등록되지 않았습니다.'}</p>
        </div>
        <div>
          <div class="project-meta">
            <span>🔧 ${language || '기타'}</span>
            <span>⭐ ${stargazers_count}</span>
          </div>
          <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">저장소 보기</a>
        </div>
      </article>
    `)
    .join('');
};

const fetchProjects = async () => {
  // 로컬 프로젝트 기본 렌더링 (이미지 즉시 표시)
  renderProjects(localProjects);

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
    if (!response.ok) return;

    const repos = await response.json();
    if (!repos || repos.length === 0) return;

    // GitHub 레포지토리 정보에 준비된 로컬 이미지 매핑
    const combinedProjects = repos.map((repo) => {
      let matchedImage = '';
      if (repo.name.toLowerCase().includes('study') || repo.name.toLowerCase().includes('codyssey')) {
        matchedImage = 'images/Codyssey%20Study.png';
      } else if (repo.name.toLowerCase().includes('gauss')) {
        matchedImage = 'images/Team%20GaussX.png';
      }

      return {
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        image: matchedImage
      };
    });

    // 만약 매핑된 이미지가 없다면 준비한 로컬 프로젝트 카드를 유지/결합
    const hasImageProject = combinedProjects.some(p => p.image);
    if (hasImageProject) {
      renderProjects(combinedProjects);
    }
  } catch (error) {
    // API 제한 또는 네트워크 에러 시에도 기본 로컬 카드 유지
    console.warn('GitHub API 연동 실패, 기본 프로젝트를 표시합니다:', error.message);
  }
};

// 6. Contact 폼 검증 (입력 -> 유효성 상태 판단 -> 에러 렌더링)
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const nameInput = document.querySelector('#contact-name');
  const emailInput = document.querySelector('#contact-email');
  const messageInput = document.querySelector('#contact-message');

  const nameError = document.querySelector('#name-error');
  const emailError = document.querySelector('#email-error');
  const messageError = document.querySelector('#message-error');
  const formSuccess = document.querySelector('#form-success-msg');

  let isValid = true;

  // 이름 검증
  if (!nameInput.value.trim()) {
    nameError.textContent = '이름을 입력해 주세요.';
    isValid = false;
  } else {
    nameError.textContent = '';
  }

  // 이메일 검증
  if (!emailInput.value.trim()) {
    emailError.textContent = '이메일을 입력해 주세요.';
    isValid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    emailError.textContent = '올바른 이메일 형식이 아닙니다.';
    isValid = false;
  } else {
    emailError.textContent = '';
  }

  // 메시지 검증
  if (!messageInput.value.trim()) {
    messageError.textContent = '메시지를 입력해 주세요.';
    isValid = false;
  } else {
    messageError.textContent = '';
  }

  // 검증 통과 처리
  if (isValid) {
    formSuccess.textContent = '메시지가 성공적으로 전송되었습니다!';
    contactForm.reset();
    setTimeout(() => {
      formSuccess.textContent = '';
    }, 4000);
  } else {
    formSuccess.textContent = '';
  }
});

// 초기 실행
initTheme();
fetchProjects();