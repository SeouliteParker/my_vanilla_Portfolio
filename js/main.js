
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

// 5. 프로젝트 목록 (GitHub API 연동: 로딩 -> 성공/에러/빈 상태 -> 렌더링)

// 로딩 상태 UI
const renderProjectsLoading = () => {
  if (!projectsContainer) return;
  projectsContainer.innerHTML = `
    <div class="projects-status">
      <div class="spinner" aria-hidden="true"></div>
      <p>프로젝트를 불러오는 중...</p>
    </div>
  `;
};

// 에러 상태 UI (+ 재시도 버튼)
const renderProjectsError = () => {
  if (!projectsContainer) return;
  projectsContainer.innerHTML = `
    <div class="projects-status">
      <p>프로젝트를 불러올 수 없습니다.</p>
      <button type="button" id="projects-retry-btn" class="btn btn-secondary">다시 시도</button>
    </div>
  `;

  const retryBtn = document.querySelector('#projects-retry-btn');
  retryBtn.addEventListener('click', fetchProjects);
};

// 빈 상태 UI
const renderProjectsEmpty = () => {
  if (!projectsContainer) return;
  projectsContainer.innerHTML = `
    <div class="projects-status">
      <p>표시할 프로젝트가 없습니다.</p>
    </div>
  `;
};

// 성공 상태 UI: repos 배열 -> 카드 리스트
const renderProjectCards = (repos) => {
  if (!projectsContainer) return;

  projectsContainer.innerHTML = repos
    .map(({ name, description, html_url, stargazers_count, language }) => `
      <article class="project-card">
        <div>
          <h3 class="project-title">${name}</h3>
          <p class="project-desc">${description ? description : '설명이 등록되지 않은 저장소입니다.'}</p>
        </div>
        <div>
          <div class="project-meta">
            <span>🔧 ${language ? language : 'N/A'}</span>
            <span>⭐ ${stargazers_count}</span>
          </div>
          <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">저장소 보기</a>
        </div>
      </article>
    `)
    .join('');
};

// GitHub API 호출: 로딩 -> fetch -> 성공/빈/에러 상태 분기
const fetchProjects = async () => {
  renderProjectsLoading();

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
    );

    // 레이트 리밋(403) 등 HTTP 에러 상태 처리
    if (!response.ok) {
      throw new Error(`GitHub API 요청 실패: ${response.status}`);
    }

    const repos = await response.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      renderProjectsEmpty();
      return;
    }

    renderProjectCards(repos);
  } catch (error) {
    console.error('프로젝트를 불러오는 중 오류가 발생했습니다.', error);
    renderProjectsError();
  }
};

// 6. Contact 폼 검증 (입력 -> 유효성 상태 판단 -> 에러 렌더링)
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// input 이벤트: 타이핑하는 동안 해당 필드의 에러 상태를 실시간으로 해제
const nameInputEl = document.querySelector('#contact-name');
const emailInputEl = document.querySelector('#contact-email');
const messageInputEl = document.querySelector('#contact-message');

const clearFieldError = (inputEl, errorEl) => {
  inputEl.addEventListener('input', () => {
    if (inputEl.value.trim()) {
      errorEl.textContent = '';
    }
  });
};

clearFieldError(nameInputEl, document.querySelector('#name-error'));
clearFieldError(emailInputEl, document.querySelector('#email-error'));
clearFieldError(messageInputEl, document.querySelector('#message-error'));

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
