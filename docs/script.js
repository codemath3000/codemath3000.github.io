const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const canvas = document.querySelector("[data-signal-canvas]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (canvas) {
  const context = canvas.getContext("2d");
  const points = [];
  const labels = [
    { text: "MCP", color: "#73d5bd" },
    { text: "16x", color: "#f4a261" },
    { text: "#183", color: "#ff8066" },
    { text: "AI", color: "#9bb7ff" },
    { text: "4.00", color: "#f5ce75" }
  ];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let deviceRatio = 1;
  let animationFrame = 0;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    canvas.width = Math.floor(width * deviceRatio);
    canvas.height = Math.floor(height * deviceRatio);
    context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);

    points.length = 0;
    const count = width < 720 ? 42 : 68;

    for (let index = 0; index < count; index += 1) {
      points.push({
        x: width * (0.38 + Math.random() * 0.58),
        y: height * (0.08 + Math.random() * 0.84),
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        radius: 1.2 + Math.random() * 2.2
      });
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#131712";
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.18;
    context.strokeStyle = "#f8fbf8";
    context.lineWidth = 1;

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];

      if (!prefersReducedMotion) {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < width * 0.36 || point.x > width * 0.99) point.vx *= -1;
        if (point.y < height * 0.05 || point.y > height * 0.95) point.vy *= -1;
      }

      for (let j = i + 1; j < points.length; j += 1) {
        const other = points[j];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);

        if (distance < 132) {
          context.globalAlpha = (1 - distance / 132) * 0.18;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    }

    points.forEach((point, index) => {
      const label = labels[index % labels.length];
      context.globalAlpha = 0.86;
      context.fillStyle = label.color;
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    });

    labels.forEach((label, index) => {
      const x = width * (0.56 + (index % 2) * 0.24);
      const y = height * (0.18 + index * 0.14);

      context.globalAlpha = 0.1;
      context.fillStyle = label.color;
      context.fillRect(x - 16, y - 18, 86, 34);
      context.globalAlpha = 0.88;
      context.fillStyle = "#f8fbf8";
      context.font = "700 13px ui-sans-serif, system-ui, sans-serif";
      context.fillText(label.text, x, y + 4);
    });

    context.globalAlpha = 1;

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  resizeCanvas();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    draw();
  });
}
