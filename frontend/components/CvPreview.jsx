"use client";

// CV jonli ko'rinishi - A4 formatda, PDF'dagi 3 shablonga mos
export default function CvPreview({ cv }) {
  const p = cv.personalInfo || {};
  const exp = cv.experience || [];
  const edu = cv.education || [];
  const skills = cv.skills || [];
  const langs = cv.languages || [];

  if (cv.template === "classic") return <Classic p={p} exp={exp} edu={edu} skills={skills} langs={langs} />;
  if (cv.template === "minimal") return <Minimal p={p} exp={exp} edu={edu} skills={skills} langs={langs} />;
  return <Modern p={p} exp={exp} edu={edu} skills={skills} langs={langs} />;
}

/* ---------- MODERN ---------- */
function Modern({ p, exp, edu, skills, langs }) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white text-[11px] leading-snug">
      {/* Chap panel */}
      <div className="flex w-1/3 flex-col bg-brand-600 px-5 py-8 text-white">
        {p.photo && (
          <div className="mb-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt="Photo" className="h-28 w-28 rounded-full border-4 border-white/30 object-cover" />
          </div>
        )}
        <h1 className="font-display text-xl font-bold uppercase">{p.fullName || "Ismingiz"}</h1>
        <p className="mt-1 text-white/80">{p.position || "Mutaxassislik"}</p>

        <div className="mt-6 space-y-2 border-t border-white/25 pt-4 text-[10px]">
          {p.phone && <p><b>Tel:</b> {p.phone}</p>}
          {p.email && <p className="break-all"><b>Email:</b> {p.email}</p>}
          {p.address && <p><b>Manzil:</b> {p.address}</p>}
        </div>

        {skills.length > 0 && (
          <div className="mt-6 border-t border-white/25 pt-4">
            <SideTitle>Ko'nikmalar</SideTitle>
            <ul className="mt-2 space-y-1.5 text-[10px]">
              {skills.map((s, i) => (
                <li key={i} className="flex gap-1.5"><span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" />{s}</li>
              ))}
            </ul>
          </div>
        )}

        {langs.length > 0 && (
          <div className="mt-6 border-t border-white/25 pt-4">
            <SideTitle>Tillar</SideTitle>
            <ul className="mt-2 space-y-1 text-[10px]">
              {langs.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* O'ng qism */}
      <div className="flex-1 px-6 py-8">
        {p.about && (<Section title="Men haqimda"><p className="text-slate-600">{p.about}</p></Section>)}
        {exp.length > 0 && (
          <Section title="Ish tajribasi">
            <div className="space-y-4">
              {exp.map((e, i) => (
                <div key={i}>
                  <p className="font-bold text-slate-800">{e.position}</p>
                  <p className="text-[10px] font-semibold text-brand-600">{e.company} · {e.start} — {e.end || "hozirgacha"}</p>
                  {e.description && <p className="mt-1 text-slate-600">{e.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
        {edu.length > 0 && (
          <Section title="Ta'lim">
            <div className="space-y-3">
              {edu.map((d, i) => (
                <div key={i}>
                  <p className="font-bold text-slate-800">{d.school}</p>
                  <p className="text-[10px] text-slate-500">{d.degree} · {d.start} — {d.end}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ---------- CLASSIC ---------- */
function Classic({ p, exp, edu, skills, langs }) {
  return (
    <div className="h-full overflow-hidden bg-white px-12 py-10 font-serif text-[11px] text-slate-700">
      <div className="border-b-2 border-slate-800 pb-4 text-center">
        {p.photo && (
          <div className="mb-3 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt="Photo" className="h-24 w-24 rounded-full border-2 border-slate-300 object-cover" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{p.fullName || "Ismingiz"}</h1>
        <p className="mt-1 italic text-slate-500">{p.position || "Mutaxassislik"}</p>
        <p className="mt-2 text-[10px] text-slate-500">
          {[p.phone, p.email, p.address].filter(Boolean).join(" • ")}
        </p>
      </div>

      {p.about && <CSection title="Men Haqimda"><p>{p.about}</p></CSection>}
      {exp.length > 0 && (
        <CSection title="Ish Tajribasi">
          {exp.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{e.position}, {e.company}</span>
                <span className="shrink-0 pl-2 italic text-slate-400">{e.start} — {e.end || "hozirgacha"}</span>
              </div>
              {e.description && <p className="mt-0.5">{e.description}</p>}
            </div>
          ))}
        </CSection>
      )}
      {edu.length > 0 && (
        <CSection title="Ta'lim">
          {edu.map((d, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{d.school}</span>
                <span className="italic text-slate-400">{d.start} — {d.end}</span>
              </div>
              {d.degree && <p>{d.degree}</p>}
            </div>
          ))}
        </CSection>
      )}
      {skills.length > 0 && (
        <CSection title="Ko'nikmalar"><p className="tracking-wide">{skills.join("   •   ")}</p></CSection>
      )}
      {langs.length > 0 && (
        <CSection title="Tillar"><p className="tracking-wide">{langs.join("   •   ")}</p></CSection>
      )}
    </div>
  );
}

/* ---------- MINIMAL ---------- */
function Minimal({ p, exp, edu, skills, langs }) {
  return (
    <div className="h-full overflow-hidden bg-white px-10 py-10 text-[11px]">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        {p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.photo} alt="Photo" className="h-20 w-20 shrink-0 rounded-full border border-slate-200 object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{p.fullName || "Ismingiz"}</h1>
          <p className="mt-0.5 text-slate-400">{p.position || "Mutaxassislik"}</p>
          <p className="mt-2 text-[10px] text-slate-400">{[p.phone, p.email, p.address].filter(Boolean).join("  |  ")}</p>
        </div>
      </div>

      {p.about && <MSection title="Men haqimda"><p className="text-slate-600">{p.about}</p></MSection>}
      {exp.length > 0 && (
        <MSection title="Ish tajribasi">
          {exp.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900">{e.position}</span>
                <span className="text-[9px] text-slate-400">{e.start} — {e.end || "hozirgacha"}</span>
              </div>
              <p className="text-[10px] font-semibold text-brand-600">{e.company}</p>
              {e.description && <p className="mt-0.5 text-slate-600">{e.description}</p>}
            </div>
          ))}
        </MSection>
      )}
      {edu.length > 0 && (
        <MSection title="Ta'lim">
          {edu.map((d, i) => (
            <div key={i} className="mb-2 flex items-baseline justify-between">
              <div><p className="font-bold text-slate-900">{d.school}</p>{d.degree && <p className="text-slate-500">{d.degree}</p>}</div>
              <span className="text-[9px] text-slate-400">{d.start} — {d.end}</span>
            </div>
          ))}
        </MSection>
      )}
      {skills.length > 0 && <MSection title="Ko'nikmalar"><p className="text-slate-600">{skills.join("  ·  ")}</p></MSection>}
      {langs.length > 0 && <MSection title="Tillar"><p className="text-slate-600">{langs.join("  ·  ")}</p></MSection>}
    </div>
  );
}

/* Yordamchi bo'limlar */
const Section = ({ title, children }) => (
  <div className="mb-5 last:mb-0">
    <h2 className="mb-2 inline-block border-b-2 border-brand-500 pb-0.5 text-xs font-bold uppercase tracking-wider text-brand-700">
      {title}
    </h2>
    {children}
  </div>
);
const SideTitle = ({ children }) => (
  <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/90">{children}</h2>
);
const CSection = ({ title, children }) => (
  <div className="mt-5">
    <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">{title}</h2>
    {children}
  </div>
);
const MSection = ({ title, children }) => (
  <div className="mt-5">
    <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {title}
      <span className="h-px flex-1 bg-slate-100" />
    </h2>
    {children}
  </div>
);
