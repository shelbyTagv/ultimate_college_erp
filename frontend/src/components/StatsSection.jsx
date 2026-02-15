import { useRef, useState, useEffect } from 'react'
import AnimateOnScroll from './AnimateOnScroll'

const stats = [
    { id: 1, label: 'Pass Rate (ZIMSEC)', value: '100%', icon: '📈' },
    { id: 2, label: 'Qualified Teachers', value: '45+', icon: '👨‍🏫' },
    { id: 3, label: 'Enrolled Students', value: '1200+', icon: '🎓' },
    { id: 4, label: 'Years of Excellence', value: '25', icon: '🏛️' },
]

export default function StatsSection() {
    return (
        <section className="stats-section">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((stat, i) => (
                        <AnimateOnScroll key={stat.id} delay={i * 0.1}>
                            <div className="stat-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </div>
            <style>{`
        .stats-section {
          padding: 4rem 0;
          background: var(--neutral);
          border-bottom: 1px solid var(--border);
          position: relative;
          z-index: 5;
          margin-top: -3rem; /* Overlap effect */
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        @media (min-width: 768px) {
            .stats-section {
                margin: -4rem 2rem 2rem;
                border-radius: var(--radius);
            }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat-card {
          padding: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }

        .stat-value {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }
      `}</style>
        </section>
    )
}
