const courseLessons = [
  { id: "reading-code", number: "01", title: "代码应该怎么读？", file: "01-reading-code.html", chapter: "代码基础" },
  { id: "file-structure", number: "02", title: "文件放在哪里？", file: "02-file-structure.html", chapter: "代码基础" },
  { id: "symbols", number: "03", title: "标签、括号和引号", file: "03-symbols.html", chapter: "代码基础" },
  { id: "variables-functions", number: "04", title: "变量和函数", file: "04-variables-functions.html", chapter: "代码基础" },
  { id: "errors", number: "05", title: "报错不可怕", file: "05-errors.html", chapter: "代码基础" },
  { id: "html", number: "06", title: "HTML：安排内容", file: "06-html.html", chapter: "网页三件套" },
  { id: "css", number: "07", title: "CSS：设计样子", file: "07-css.html", chapter: "网页三件套" },
  { id: "javascript", number: "08", title: "JavaScript：回应操作", file: "08-javascript.html", chapter: "网页三件套" },
  { id: "project", number: "09", title: "学习打卡卡片", file: "09-project.html", chapter: "综合项目" }
];

const pageId = document.body.dataset.page;
const base = document.body.dataset.base || "./";
const totalLessons = courseLessons.length;

function getCompletedLessons() {
  try {
    return new Set(JSON.parse(localStorage.getItem("zero-course-completed") || "[]"));
  } catch {
    return new Set();
  }
}

function saveCompletedLessons(completed) {
  localStorage.setItem("zero-course-completed", JSON.stringify([...completed]));
}

function lessonHref(lesson) {
  return `${base}lessons/${lesson.file}`;
}

function renderSidebar() {
  const sidebar = document.getElementById("courseSidebar");
  if (!sidebar) return;
  const completed = getCompletedLessons();
  const chapters = ["代码基础", "网页三件套", "综合项目"];
  const chapterLabels = { "代码基础": "第一章", "网页三件套": "第二章", "综合项目": "第三章" };

  sidebar.innerHTML = `
    <div class="sidebar-brand-row">
      <a class="course-brand" href="${base}index.html" aria-label="课程首页">
        <span class="brand-glyph">&lt;/&gt;</span><span><strong>从零开始</strong><small>AI 开发课程</small></span>
      </a>
      <button class="sidebar-close" type="button" aria-label="关闭目录">×</button>
    </div>
    <a class="sidebar-home ${pageId === "home" ? "is-active" : ""}" href="${base}index.html">
      <span class="home-icon">⌂</span><span>课程首页</span>
    </a>
    <div class="sidebar-progress">
      <div><span>总进度</span><strong data-sidebar-progress>${completed.size} / ${totalLessons}</strong></div>
      <i><b style="width:${(completed.size / totalLessons) * 100}%"></b></i>
    </div>
    <nav class="course-tree" aria-label="课程目录">
      ${chapters.map((chapter) => `
        <section>
          <h2>${chapterLabels[chapter]}<span>${chapter}</span></h2>
          ${courseLessons.filter((lesson) => lesson.chapter === chapter).map((lesson) => `
            <a href="${lessonHref(lesson)}" class="${pageId === lesson.id ? "is-active" : ""} ${completed.has(lesson.id) ? "is-complete" : ""}">
              <span class="lesson-dot">${completed.has(lesson.id) ? "✓" : lesson.number}</span>
              <em>${lesson.title}</em>
              ${pageId === lesson.id ? '<i aria-hidden="true"></i>' : ""}
            </a>
          `).join("")}
        </section>
      `).join("")}
    </nav>
    <div class="sidebar-help"><span>?</span><p><strong>卡住了吗？</strong><small>先运行一遍，再只改一行。</small></p></div>
  `;
}

function renderTopbar() {
  const topbar = document.getElementById("courseTopbar");
  if (!topbar) return;
  const lesson = courseLessons.find((item) => item.id === pageId);
  topbar.innerHTML = `
    <button class="menu-button" type="button" aria-label="打开课程目录"><span></span><span></span><span></span></button>
    <div class="topbar-location">${lesson ? `<span>${lesson.chapter}</span><b>/</b><strong>${lesson.title}</strong>` : "<strong>课程首页</strong>"}</div>
    <div class="topbar-actions">
      <button class="theme-toggle" type="button" aria-label="切换深浅主题">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
      <a href="${base}index.html#curriculum">全部课程</a>
    </div>
  `;
}

function setupShell() {
  renderSidebar();
  renderTopbar();
  const overlay = document.createElement("button");
  overlay.className = "sidebar-overlay";
  overlay.type = "button";
  overlay.setAttribute("aria-label", "关闭课程目录");
  document.body.appendChild(overlay);

  const openMenu = () => document.body.classList.add("sidebar-open");
  const closeMenu = () => document.body.classList.remove("sidebar-open");
  document.querySelector(".menu-button")?.addEventListener("click", openMenu);
  document.querySelector(".sidebar-close")?.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  const savedTheme = localStorage.getItem("zero-course-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-theme");
  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("zero-course-theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
  });
}

function setupCodeBlocks() {
  document.querySelectorAll(".code-block").forEach((block) => {
    const button = block.querySelector("[data-copy]");
    if (!button) return;
    button.addEventListener("click", async () => {
      const code = block.querySelector("code")?.innerText || "";
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = "已复制 ✓";
      } catch {
        button.textContent = "选中代码复制";
      }
      setTimeout(() => { button.textContent = "复制"; }, 1600);
    });
  });
}

function buildPreviewDocument(html, css, js, playgroundId) {
  const bridge = `
    const send = (kind, value) => parent.postMessage({ source: "zero-playground", id: ${JSON.stringify(playgroundId)}, kind, value: String(value) }, "*");
    const originalLog = console.log;
    console.log = (...args) => { originalLog(...args); send("log", args.join(" ")); };
    window.addEventListener("error", event => send("error", event.message));
    const userCode = ${JSON.stringify(js)};
    try { new Function(userCode)(); } catch (error) { send("error", error.message); }
  `;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1c211b;background:#fff}${css}</style></head><body>${html}<script>${bridge}<\/script></body></html>`;
}

function setupPlaygrounds() {
  document.querySelectorAll(".code-playground").forEach((playground, index) => {
    const playgroundId = `${pageId}-${index}`;
    const editors = [...playground.querySelectorAll(".playground-editor")];
    const tabs = [...playground.querySelectorAll("[data-editor-tab]")];
    const frame = playground.querySelector("iframe");
    const consoleOutput = playground.querySelector(".console-output");
    const runButton = playground.querySelector("[data-run]");
    const resetButton = playground.querySelector("[data-reset]");
    const starter = Object.fromEntries(editors.map((editor) => [editor.dataset.lang, editor.value]));

    const run = () => {
      const values = Object.fromEntries(editors.map((editor) => [editor.dataset.lang, editor.value]));
      consoleOutput.innerHTML = '<span class="console-muted">运行成功。控制台输出会显示在这里。</span>';
      frame.srcdoc = buildPreviewDocument(values.html || "", values.css || "", values.js || "", playgroundId);
      runButton.classList.add("just-ran");
      runButton.innerHTML = "已运行 <span>✓</span>";
      setTimeout(() => { runButton.classList.remove("just-ran"); runButton.innerHTML = "运行代码 <span>▶</span>"; }, 1200);
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      editors.forEach((editor) => { editor.hidden = editor.dataset.lang !== tab.dataset.editorTab; });
    }));
    runButton.addEventListener("click", run);
    resetButton.addEventListener("click", () => {
      editors.forEach((editor) => { editor.value = starter[editor.dataset.lang]; });
      run();
    });
    editors.forEach((editor) => editor.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = editor.selectionStart;
        editor.value = `${editor.value.slice(0, start)}  ${editor.value.slice(editor.selectionEnd)}`;
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") run();
    }));
    playground.dataset.playgroundId = playgroundId;
    run();
  });

  window.addEventListener("message", (event) => {
    if (event.data?.source !== "zero-playground") return;
    const playground = document.querySelector(`[data-playground-id="${event.data.id}"]`);
    const output = playground?.querySelector(".console-output");
    if (!output) return;
    if (output.querySelector(".console-muted")) output.innerHTML = "";
    const line = document.createElement("span");
    line.className = event.data.kind === "error" ? "console-error" : "console-line";
    line.textContent = `${event.data.kind === "error" ? "错误" : ">"} ${event.data.value}`;
    output.appendChild(line);
  });
}

function setupQuiz() {
  document.querySelectorAll(".lesson-quiz").forEach((quiz) => {
    const answer = quiz.dataset.answer;
    const feedback = quiz.querySelector(".quiz-result");
    quiz.querySelectorAll("[data-choice]").forEach((choice) => {
      choice.addEventListener("click", () => {
        quiz.querySelectorAll("[data-choice]").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
        const correct = choice.dataset.choice === answer;
        choice.classList.add(correct ? "is-correct" : "is-wrong");
        feedback.className = `quiz-result ${correct ? "is-success" : "is-retry"}`;
        feedback.textContent = correct
          ? (quiz.dataset.success || "答对了！你已经抓住这一课最重要的部分。")
          : "还差一点。回看上方加粗的句子，再选一次就好。";
        if (correct && pageId !== "home") markLessonComplete(pageId);
      });
    });
  });
}

function markLessonComplete(id) {
  const completed = getCompletedLessons();
  completed.add(id);
  saveCompletedLessons(completed);
  document.querySelector("[data-complete-lesson]")?.classList.add("is-complete");
  const completeButton = document.querySelector("[data-complete-lesson]");
  if (completeButton) completeButton.innerHTML = "本课已完成 <span>✓</span>";
  renderSidebar();
  document.querySelector(".sidebar-close")?.addEventListener("click", () => document.body.classList.remove("sidebar-open"));
}

function setupLessonCompletion() {
  if (pageId === "home") return;
  const completed = getCompletedLessons();
  const button = document.querySelector("[data-complete-lesson]");
  if (!button) return;
  if (completed.has(pageId)) {
    button.classList.add("is-complete");
    button.innerHTML = "本课已完成 <span>✓</span>";
  }
  button.addEventListener("click", () => markLessonComplete(pageId));
}

function setupHomeProgress() {
  if (pageId !== "home") return;
  const completed = getCompletedLessons();
  const percent = Math.round((completed.size / totalLessons) * 100);
  const ring = document.getElementById("homeProgressRing");
  ring.style.setProperty("--progress", `${percent * 3.6}deg`);
  document.getElementById("homeProgressNumber").textContent = `${percent}%`;
  document.getElementById("homeCompletedText").textContent = completed.size ? `已经完成 ${completed.size} 节课` : "还没有完成课程";

  const nextLesson = courseLessons.find((lesson) => !completed.has(lesson.id)) || courseLessons.at(-1);
  const continueLink = document.getElementById("continueLink");
  continueLink.href = lessonHref(nextLesson);
  continueLink.textContent = completed.size ? `继续第 ${nextLesson.number} 课 →` : "开始学习 →";

  document.querySelectorAll("[data-course-card]").forEach((card) => {
    if (completed.has(card.dataset.courseCard)) card.classList.add("is-complete");
  });
}

function setupSectionSpy() {
  const links = [...document.querySelectorAll(".on-page-nav a")];
  if (!links.length) return;
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-20% 0px -65% 0px" });
  sections.forEach((section) => observer.observe(section));
}

setupShell();
setupCodeBlocks();
setupPlaygrounds();
setupQuiz();
setupLessonCompletion();
setupHomeProgress();
setupSectionSpy();
