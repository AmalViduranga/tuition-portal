import { Metadata } from "next";
import { contactData } from "@/lib/content";
import { MessageSquare, Phone, Mail, MapPin, Send, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact MathsLK | A/L Mathematics Classes Sri Lanka",
  description: "Get in touch with MathsLK for A/L Mathematics classes. Contact Amal Viduranga via WhatsApp, phone, or email to join theory or revision classes.",
};

export default function ContactPage() {
  const whatsappNumber = contactData.whatsapp.replace('+', '');

  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 text-center shadow-sm md:p-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
          <MessageSquare className="h-4 w-4" /> Get In Touch
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-900 md:text-5xl">Contact Us</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
          Have questions or ready to join the class? Reach out to us through any of the following channels.
        </p>
      </section>

      <section className="rounded-3xl bg-emerald-50 p-8 md:p-12 text-center border border-emerald-100">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-inner">
           <svg viewBox="0 0 24 24" className="h-10 w-10 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Fastest way to get in touch</h2>
        <p className="mt-4 text-emerald-800 font-medium">Message us on WhatsApp. We usually reply within a few hours.</p>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl transition-all"
        >
          <Send className="h-5 w-5" /> Chat on WhatsApp
        </a>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:border-indigo-200 transition-colors">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-6">
            <Phone className="h-8 w-8" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Phone / WhatsApp</h2>
          <p className="mt-3 text-xl font-bold text-slate-900">{contactData.phone}</p>
          <a href={`tel:${whatsappNumber}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Call Direct
          </a>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:border-cyan-200 transition-colors">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 mb-6">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Email</h2>
          <p className="mt-3 text-xl font-bold text-slate-900 truncate">{contactData.email}</p>
          <a href={`mailto:${contactData.email}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Send Email
          </a>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:border-indigo-200 transition-colors">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-6">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Location</h2>
          <p className="mt-3 text-base font-bold text-slate-900">{contactData.location}</p>
        </article>
      </div>

      <section className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-8 md:p-12 text-center mt-4">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl mb-2">Connect with us</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-8">Follow our social media channels for updates, past paper discussions, and free educational content.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://www.youtube.com/@amalvidu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-sm border border-slate-200 hover:border-[#FF0000] hover:text-[#FF0000] transition-colors"
          >
            <svg className="h-6 w-6 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M21.764 7.218a2.536 2.536 0 00-1.782-1.8C18.411 5 12 5 12 5s-6.411 0-7.982.418a2.536 2.536 0 00-1.782 1.8C1.818 8.813 1.818 12 1.818 12s0 3.187.418 4.782A2.536 2.536 0 004.018 18.582C5.589 19 12 19 12 19s6.411 0 7.982-.418a2.536 2.536 0 001.782-1.8C22.182 15.187 22.182 12 22.182 12s0-3.187-.418-4.782zM9.75 14.99V9l5.528 2.99-5.528 3z" clipRule="evenodd" />
            </svg> YouTube Channel
          </a>
          
          <a
            href="https://www.facebook.com/share/1FadraTpVk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-sm border border-slate-200 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors"
          >
            <svg className="h-6 w-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg> Facebook Page
          </a>
        </div>
        
        <div className="mt-10 pt-8 border-t border-indigo-100/60 max-w-2xl mx-auto flex flex-col items-center">
          <p className="text-lg font-bold text-indigo-900 mb-4">Registration is open for the new intake</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
          >
            Join the Class <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
