import { onMounted } from 'vue'

export function useScrollReveal(): void {
  onMounted(() => {
    const elements = document.querySelectorAll('.fade-in-on-scroll')
    if (!elements.length) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    elements.forEach(el => observer.observe(el))
  })
}
