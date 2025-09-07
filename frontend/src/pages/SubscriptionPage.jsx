import React from "react";
import "./Subscription.css";

export default function SubscriptionPage() {
  return (
    <div className="subscription-root">
      <section className="subscription-wrapper" aria-labelledby="subscription-heading">
        <header className="subscription-header">
          <h1 id="subscription-heading">Subscription</h1>
          <p>Start for free, upgrade when you're ready.</p>
        </header>

        <div className="subscription-grid">
          {/* Free */}
          <article className="subscription-card" aria-label="Free plan">
            <div className="card-head">
              <h2 className="plan">Free</h2>
              <p className="price">Free</p>
            </div>

            <ul className="features" role="list">
              <Feature text="10 rides per month" />
              <Feature text="Basic support" />
              <Feature text="Standard vehicles" />
              <Feature text="Community forum" />
            </ul>

            <div className="cta-row">
              <button className="btn btn-ghost" aria-label="Get started with Free plan">
                Get started
              </button>
            </div>
          </article>

          {/* Premium (Most Popular) */}
          <article className="subscription-card card-popular" aria-label="Premium plan">
            <div className="popular-chip" aria-hidden>
              <span>Most popular</span>
            </div>
            <div className="card-head">
              <h2 className="plan">Premium</h2>
              <p className="price">
                <span className="amount">$10</span>
                <span className="per">/mo</span>
              </p>
            </div>

            <ul className="features" role="list">
              <Feature text="25 rides per month" />
              <Feature text="Priority support" />
              <Feature text="Premium vehicles" />
              <Feature text="Community forum" />
            </ul>

            <div className="cta-row">
              <button className="btn btn-primary" aria-label="Upgrade to Premium">
                Upgrade
              </button>
            </div>
          </article>

          {/* Pro */}
          <article className="subscription-card" aria-label="Pro plan">
            <div className="card-head">
              <h2 className="plan">Pro</h2>
              <p className="price">
                <span className="amount">$20</span>
                <span className="per">/mo</span>
              </p>
            </div>

            <ul className="features" role="list">
              <Feature text="Unlimited rides" />
              <Feature text="24/7 dedicated support" />
              <Feature text="Luxury vehicles" />
              <Feature text="Community forum" />
            </ul>

            <div className="cta-row">
              <button className="btn btn-outline" aria-label="Upgrade to Pro">
                Upgrade
              </button>
            </div>
          </article>
        </div>

        <p className="footnote" role="note">
          Prices are in USD. Cancel anytime. Taxes may apply.
        </p>
      </section>
    </div>
  );
}

function Feature({ text }) {
  return (
    <li className="feature">
      <svg className="tick" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{text}</span>
    </li>
  );
}
