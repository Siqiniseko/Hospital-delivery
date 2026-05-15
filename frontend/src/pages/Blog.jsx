import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, FileText, Pill, Route, Stethoscope } from "lucide-react";
import { api } from "../services/api";
import hospitalGallery from "../assets/hospital-gallery.png";

const posts = [
  {
    icon: Pill,
    title: "How patients can track pill readiness",
    category: "Pharmacy",
    readTime: "4 min read",
    text: "See what each pill status means, from requested and approved to ready for pickup or delivery.",
  },
  {
    icon: Stethoscope,
    title: "Why appointment updates matter",
    category: "Doctor care",
    readTime: "3 min read",
    text: "A clear appointment queue helps doctors prepare for patient visits and keep consultation progress visible.",
  },
  {
    icon: Route,
    title: "Safer medicine delivery with live tracking",
    category: "Delivery",
    readTime: "5 min read",
    text: "Live location updates reduce uncertainty when drivers are delivering medication to patients.",
  },
];

export default function Blog() {
  const [apiPosts, setApiPosts] = useState(posts);

  useEffect(() => {
    api.get("/site/blog")
      .then(({ data }) => setApiPosts(data.map((post) => ({
        icon: post.category === "Delivery" ? Route : post.category === "Doctor care" ? Stethoscope : Pill,
        title: post.title,
        category: post.category,
        readTime: post.readTime,
        text: post.excerpt,
        isFeatured: post.isFeatured,
      }))))
      .catch(() => setApiPosts(posts));
  }, []);

  const featured = apiPosts.find((post) => post.isFeatured) || {
    title: "What happens after a patient requests pills?",
    text: "The hospital team can approve the request, prepare the medicine, mark it ready, and let the patient know whether to fetch it or follow a delivery driver.",
  };
  const listPosts = apiPosts.filter((post) => !post.isFeatured);

  return (
    <main className="content-page">
      <section className="content-hero blog-hero">
        <div>
          <p className="hero-kicker text-only">Hospital blog</p>
          <h1>Helpful updates for patients, doctors, and delivery teams.</h1>
          <p>
            Read practical hospital guidance about appointments, pill collection,
            stock visibility, and safe medicine delivery.
          </p>
        </div>
      </section>

      <section className="blog-layout">
        <article className="featured-post">
          <div className="featured-icon"><FileText size={32} /></div>
          <p className="eyebrow">Featured article</p>
          <h2>{featured.title}</h2>
          <p>{featured.text}</p>
          <Link to="/patient">Open patient portal <ArrowRight size={18} /></Link>
        </article>

        <div className="blog-list">
          {listPosts.map(({ icon: Icon, title, category, readTime, text }) => (
            <article className="blog-card" key={title}>
              <Icon size={26} />
              <div>
                <div className="post-meta">
                  <span><CalendarDays size={15} />{category}</span>
                  <span><Clock size={15} />{readTime}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hospital-gallery-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hospital photos</p>
            <h2>Modern care spaces for appointments, pharmacy, and delivery coordination.</h2>
          </div>
        </div>
        <img src={hospitalGallery} alt="Modern hospital exterior, reception, and pharmacy handover areas" />
      </section>
    </main>
  );
}
