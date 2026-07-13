import { AnimatePresence, motion, useInView, useReducedMotion } from "../lib/motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useContactPlane } from "../context/ContactPlaneContext";
import {
  CONTACT_BODY,
  CONTACT_BRIDGE,
  CONTACT_BUDGETS,
  CONTACT_EMAIL,
  CONTACT_FORM,
  CONTACT_REASSURANCE,
  CONTACT_TAGLINE,
  CONTACT_THEME,
  CONTACT_TIMELINES,
  CONTACT_TOPICS,
} from "../data/contact";
import ContactAtmosphere from "./ContactAtmosphere";
import { ContactEnvelopeIcon, ContactSubmitButton } from "./PaperPlaneContact";
import "./ContactAtmosphere.css";
import "./ContactSection.css";
import "./PaperPlaneContact.css";

const OPENING_CHARS = ["そ", "の", "先"] as const;
const EASE = [0.22, 1, 0.36, 1] as const;
const BREATH = { duration: 4.8, repeat: Infinity, ease: "easeInOut" as const };
const ENVELOPE_TO_FORM_MS = 880;
const PLACEHOLDER_CYCLE_MS = 4200;

const formContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const formField = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE } },
};

type FormState = {
  name: string;
  email: string;
  message: string;
  topics: string[];
  budget: string | null;
  timeline: string | null;
};

function labelForOptions<T extends { id: string; label: string }>(options: readonly T[], ids: string[]) {
  return options.filter((option) => ids.includes(option.id)).map((option) => option.label);
}

function buildMailto(form: FormState) {
  const subject = encodeURIComponent("AINO creator お便り");
  const topicLabels = labelForOptions(CONTACT_TOPICS, form.topics);
  const budgetLabel = CONTACT_BUDGETS.find((item) => item.id === form.budget)?.label;
  const timelineLabel = CONTACT_TIMELINES.find((item) => item.id === form.timeline)?.label;

  const lines = [
    `${form.name} さんより`,
    form.email,
    "",
    "【ご相談内容】",
    topicLabels.length > 0 ? topicLabels.join("、") : "（未選択）",
    "",
    budgetLabel ? `【ご予算】${budgetLabel}` : null,
    timelineLabel ? `【希望時期】${timelineLabel}` : null,
    budgetLabel || timelineLabel ? "" : null,
    "【メッセージ】",
    form.message,
  ].filter((line): line is string => line !== null);

  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function ContactField({
  step,
  label,
  hint,
  children,
  active,
  optional,
  optionalLabel = CONTACT_FORM.budgetOptional,
}: {
  step?: number;
  label: string;
  hint?: string;
  children: ReactNode;
  active: boolean;
  optional?: boolean;
  optionalLabel?: string;
}) {
  return (
    <motion.div
      className="contact-form__field"
      variants={formField}
      animate={active ? { x: [0, 1.5, 0] } : { x: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="contact-form__field-head">
        {step ? <span className="contact-form__step" aria-hidden="true">{step}</span> : null}
        <div className="contact-form__field-copy">
          <motion.span
            className="contact-form__label"
            animate={active ? { y: [0, -1, 0], opacity: [1, 0.88, 1] } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {label}
          </motion.span>
          {hint ? <span className="contact-form__hint">{hint}</span> : null}
          {optional ? <span className="contact-form__optional">{optionalLabel}</span> : null}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function ContactChipGroup({
  options,
  selected,
  onChange,
  multiple,
  name,
  error,
}: {
  options: readonly { id: string; label: string; highlight?: boolean }[];
  selected: string[];
  onChange: (next: string[]) => void;
  multiple: boolean;
  name: string;
  error?: string;
}) {
  const toggle = (id: string, highlight?: boolean) => {
    const isSelected = selected.includes(id);

    if (multiple) {
      if (highlight) {
        onChange(isSelected ? [] : [id]);
        return;
      }
      const withoutUndecided = selected.filter(
        (value) => value !== options.find((option) => option.highlight)?.id,
      );
      if (isSelected) {
        onChange(withoutUndecided.filter((value) => value !== id));
        return;
      }
      onChange([...withoutUndecided, id]);
      return;
    }

    onChange(isSelected ? [] : [id]);
  };

  return (
    <div className="contact-chips" role="group" aria-label={name}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <motion.button
            key={option.id}
            type="button"
            className={`contact-chip${option.highlight ? " contact-chip--highlight" : ""}${isSelected ? " contact-chip--selected" : ""}`}
            aria-pressed={isSelected}
            onClick={() => toggle(option.id, option.highlight)}
            whileTap={{ scale: 0.96 }}
            animate={
              isSelected
                ? { y: -1, boxShadow: "0 6px 16px rgba(79, 47, 53, 0.08)" }
                : { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" }
            }
            transition={{ duration: 0.28, ease: EASE }}
          >
            <span className="contact-chip__mark" aria-hidden="true">
              {isSelected ? "✓" : "□"}
            </span>
            <span>{option.label}</span>
          </motion.button>
        );
      })}
      {error ? <p className="contact-chips__error" role="alert">{error}</p> : null}
    </div>
  );
}

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const arrivalInView = useInView(arrivalRef, { once: true, margin: "0px 0px -12% 0px" });
  const reduceMotion = useReducedMotion();
  const { landedViaPlane, phase, flightIntent, launchSubmit } = useContactPlane();
  const [hashContact, setHashContact] = useState(() =>
    typeof window !== "undefined" ? window.location.hash === "#contact" : false,
  );
  const [formAfterEnvelope, setFormAfterEnvelope] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
    topics: [],
    budget: null,
    timeline: null,
  });

  const submitting = phase === "flying" && flightIntent === "submit";
  const arrivedByPlane = landedViaPlane && phase === "landed";
  const messageFocused = activeField === "message";
  const fillProgress =
    (Number(form.name.trim().length > 0) +
      Number(form.email.trim().length > 0) +
      Number(form.topics.length > 0) +
      Number(form.message.trim().length > 0)) /
    4;

  useEffect(() => {
    const syncHash = () => setHashContact(window.location.hash === "#contact");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (messageFocused || form.message.trim().length > 0 || reduceMotion) return;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % CONTACT_FORM.messagePlaceholders.length);
    }, PLACEHOLDER_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [form.message, messageFocused, reduceMotion]);

  useEffect(() => {
    const onLanded = () => {
      window.setTimeout(() => setFormAfterEnvelope(true), reduceMotion ? 80 : ENVELOPE_TO_FORM_MS);
    };
    const onSent = () => setSent(true);
    window.addEventListener("aino:contact-plane-landed", onLanded);
    window.addEventListener("aino:contact-submit-sent", onSent);
    return () => {
      window.removeEventListener("aino:contact-plane-landed", onLanded);
      window.removeEventListener("aino:contact-submit-sent", onSent);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (phase === "flying" && flightIntent === "navigate") {
      setFormAfterEnvelope(false);
      setSent(false);
    }
  }, [phase, flightIntent]);

  const reachedContact = inView || arrivalInView || hashContact || Boolean(reduceMotion);

  const showForm =
    !sent &&
    !submitting &&
    (arrivedByPlane ? formAfterEnvelope : reachedContact && phase !== "flying");
  const showEnvelope = sent || (arrivedByPlane && !sent);
  const showThanks = sent;

  const handleLaunchSubmit = useCallback(
    (origin: { x: number; y: number }) => {
      if (form.topics.length === 0) {
        setTopicError(CONTACT_FORM.topicRequired);
        return;
      }
      setTopicError(null);
      if (!formRef.current?.reportValidity()) return;
      const mailto = buildMailto(form);
      if (reduceMotion) {
        window.location.href = mailto;
        setSent(true);
        return;
      }
      launchSubmit(origin, mailto);
    },
    [form, launchSubmit, reduceMotion],
  );

  const messagePlaceholder =
    CONTACT_FORM.messagePlaceholders[placeholderIndex] ?? CONTACT_FORM.messagePlaceholders[0];

  return (
    <section ref={ref} className="contact-section" aria-labelledby="contact-opening-title">
      <ContactAtmosphere />
      <div className="contact-section__fade" aria-hidden="true" />

      <div className="contact-section__inner">
        <p className="contact-section__bridge" lang="ja">
          {CONTACT_BRIDGE}
        </p>
        <p className="contact-section__theme" lang="ja">
          {CONTACT_THEME.split("\n").map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className="contact-opening">
          <p className="contact-opening__en" lang="en">
            CONTACT
          </p>
          <h2 className="contact-opening__title" id="contact-opening-title">
            {OPENING_CHARS.map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                className="contact-opening__char"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={
                  inView || reduceMotion
                    ? { opacity: 1, y: reduceMotion ? 0 : [0, -1.2, 0] }
                    : { opacity: 0, y: 14 }
                }
                transition={{
                  opacity: { duration: 0.42, delay: reduceMotion ? 0 : i * 0.06, ease: EASE },
                  y: reduceMotion ? { duration: 0 } : { ...BREATH, delay: 0.5 + i * 0.08 },
                }}
              >
                {char}
              </motion.span>
            ))}
          </h2>
        </div>

        <motion.div
          className="contact-intro"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12, ease: EASE }}
        >
          <p className="contact-intro__tagline">
            {CONTACT_TAGLINE.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <div className="contact-intro__body">
            {CONTACT_BODY.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </motion.div>

        <div className="contact-arrival" ref={arrivalRef}>
          <span id="contact-plane-landing" className="contact-arrival__anchor" aria-hidden="true" />

          {(showEnvelope || showForm || showThanks || submitting) && (
            <div className={`contact-arrival__stage${submitting ? " contact-arrival__stage--submitting" : ""}`}>
              <div className="contact-action-group">
                <AnimatePresence>
                  {showEnvelope ? (
                    <motion.div
                      key="envelope"
                      className="contact-arrival__envelope"
                      initial={reduceMotion ? false : { opacity: 0, scale: sent ? 0.88 : 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: sent ? 0.72 : 0.55, ease: EASE }}
                    >
                      <ContactEnvelopeIcon />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showThanks ? (
                    <motion.div
                      key="thanks"
                      className="contact-sent"
                      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.72, ease: EASE, delay: reduceMotion ? 0 : 0.18 }}
                      aria-live="polite"
                    >
                      <p className="contact-sent__title">{CONTACT_FORM.sentTitle}</p>
                      <p className="contact-sent__sub">
                        {CONTACT_FORM.sentSubline.split("\n").map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                    </motion.div>
                  ) : showForm ? (
                    <motion.div
                      key="form-block"
                      className="contact-form-block"
                      variants={formContainer}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <motion.ul
                        className="contact-reassurance"
                        variants={formField}
                        aria-label="安心してご相談いただけます"
                      >
                        {CONTACT_REASSURANCE.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </motion.ul>

                      <motion.form
                        ref={formRef}
                        className="contact-form"
                        variants={formContainer}
                        onSubmit={(event) => event.preventDefault()}
                      >
                    <ContactField step={1} label={CONTACT_FORM.nameLabel} hint={CONTACT_FORM.nameHint} active={activeField === "name"}>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        value={form.name}
                        placeholder={CONTACT_FORM.namePlaceholder}
                        onFocus={() => setActiveField("name")}
                        onBlur={() => setActiveField(null)}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, name: event.target.value }));
                          setActiveField("name");
                        }}
                      />
                    </ContactField>

                    <ContactField step={2} label={CONTACT_FORM.emailLabel} hint={CONTACT_FORM.emailHint} active={activeField === "email"}>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        placeholder={CONTACT_FORM.emailPlaceholder}
                        onFocus={() => setActiveField("email")}
                        onBlur={() => setActiveField(null)}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, email: event.target.value }));
                          setActiveField("email");
                        }}
                      />
                    </ContactField>

                    <ContactField
                      step={3}
                      label={CONTACT_FORM.topicLabel}
                      hint={CONTACT_FORM.topicHint}
                      active={activeField === "topics" || topicError !== null}
                    >
                      <ContactChipGroup
                        name={CONTACT_FORM.topicLabel}
                        options={CONTACT_TOPICS}
                        selected={form.topics}
                        multiple
                        error={topicError ?? undefined}
                        onChange={(topics) => {
                          setForm((current) => ({ ...current, topics }));
                          setTopicError(null);
                          setActiveField("topics");
                        }}
                      />
                    </ContactField>

                    <ContactField
                      step={4}
                      label={CONTACT_FORM.messageLabel}
                      hint={CONTACT_FORM.messageHint}
                      active={activeField === "message"}
                    >
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={form.message}
                        placeholder={messagePlaceholder}
                        onFocus={() => setActiveField("message")}
                        onBlur={() => setActiveField(null)}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, message: event.target.value }));
                          setActiveField("message");
                        }}
                      />
                    </ContactField>

                    <ContactField
                      step={5}
                      label={CONTACT_FORM.budgetLabel}
                      optional
                      active={activeField === "budget"}
                    >
                      <ContactChipGroup
                        name={CONTACT_FORM.budgetLabel}
                        options={CONTACT_BUDGETS}
                        selected={form.budget ? [form.budget] : []}
                        multiple={false}
                        onChange={(values) => {
                          setForm((current) => ({ ...current, budget: values[0] ?? null }));
                          setActiveField("budget");
                        }}
                      />
                    </ContactField>

                    <ContactField
                      step={6}
                      label={CONTACT_FORM.timelineLabel}
                      optional
                      optionalLabel={CONTACT_FORM.timelineOptional}
                      active={activeField === "timeline"}
                    >
                      <ContactChipGroup
                        name={CONTACT_FORM.timelineLabel}
                        options={CONTACT_TIMELINES}
                        selected={form.timeline ? [form.timeline] : []}
                        multiple={false}
                        onChange={(values) => {
                          setForm((current) => ({ ...current, timeline: values[0] ?? null }));
                          setActiveField("timeline");
                        }}
                      />
                    </ContactField>

                    <motion.div variants={formField}>
                      <ContactSubmitButton
                        reduceMotion={reduceMotion}
                        disabled={submitting}
                        fillProgress={fillProgress}
                        onLaunch={handleLaunchSubmit}
                      />
                    </motion.div>
                      </motion.form>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
