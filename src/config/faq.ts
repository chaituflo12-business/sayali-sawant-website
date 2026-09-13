export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do I need a referral?",
    answer:
      "No. You can book an OPD slot on this website or via WhatsApp. A referral letter is useful if you already have one, but it is not required.",
  },
  {
    question: "What to bring for a first infertility visit?",
    answer:
      "Please bring previous reports (hormone tests, ultrasound, semen analysis if you have them), current prescriptions, and a photo ID. This website does not collect medical history or reports.",
  },
  {
    question: "Can I walk in without an appointment?",
    answer:
      "Walk-ins are seen only if a slot is free. Booking online holds a time for you and avoids an uncertain wait.",
  },
  {
    question: "Which languages does the doctor speak?",
    answer:
      "Dr. Sayali Sawant consults in English, Hindi and Marathi.",
  },
  {
    question: "Is the OPD wheelchair accessible?",
    answer:
      "Please message on WhatsApp before your visit if you need step-free access or other assistance. Premises details will be confirmed with the final clinic address.",
  },
  {
    question: "How do I reschedule or cancel?",
    answer:
      "Use the manage link in your confirmation message, or write on WhatsApp. Please cancel as soon as you know you cannot attend so the slot can be offered to someone else.",
  },
  {
    question: "Do you handle pregnancy emergencies?",
    answer:
      "This is an outpatient clinic. For labour pain, heavy bleeding, severe abdominal pain, or any emergency, go to the nearest hospital emergency department or call 108 / 112.",
  },
];
