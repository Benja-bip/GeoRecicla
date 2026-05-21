import AppHeader from "@/components/AppHeader";
import { Recycle, Trash2, Package, Lightbulb, Leaf, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const tips = [
    {
      icon: Trash2,
      title: "Separa tus residuos",
      text: "Usa contenedores diferenciados en tu hogar: uno para orgánicos, otro para plásticos, uno para papel y cartón, y otro para vidrio y metal. La separación en origen es el paso más importante."
    },
    {
      icon: Package,
      title: "Limpia los envases",
      text: "Enjuaga brevemente botellas, frascos y tetrapacks antes de reciclarlos. Los residuos contaminados con comida no pueden ser reciclados y terminan en el basurero."
    },
    {
      icon: Lightbulb,
      title: "Conoce los símbolos",
      text: "Aprende a identificar los códigos de reciclaje en los envases. Los números del 1 al 7 indican el tipo de plástico y si es reciclable en tu zona."
    },
    {
      icon: Leaf,
      title: "Rechaza lo que no puedas reciclar",
      text: "Evita productos de un solo uso y envases multicapa (como ciertos envases de snacks) que no son reciclables. Elige productos con envases simples y reciclables."
    }
  ];

  const mistakes = [
    "Meter bolsas plásticas en el contenedor de reciclaje",
    "Reciclar envases sin enjuagarlos",
    "Tirar pilas, bombillas o electrónicos al contenedor común",
    "Mezclar vidrio roto con vidrio de envases",
    "Reciclar papel manchado de aceite o comida"
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 space-y-8 max-w-5xl">
        {/* Hero */}
        <section className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Recycle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Cómo reciclar
              </h1>
              <p className="text-muted-foreground text-sm">
                Guía práctica para reciclar correctamente
              </p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Reciclar es más que separar la basura: es un acto de responsabilidad ambiental que reduce la contaminación, ahorra recursos naturales y construye un futuro más sostenible. En esta guía te contamos todo lo que necesitas saber para reciclar de manera efectiva.
          </p>
        </section>

        {/* Materiales reciclables */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">
            ¿Qué materiales se pueden reciclar?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Papel y cartón", examples: "Periódicos, revistas, cajas, papel de oficina" },
              { label: "Plástico", examples: "Botellas PET, envases de yogurt, tapas, bolsas de supermercado (en puntos especiales)" },
              { label: "Vidrio", examples: "Botellas, frascos, envases de conserva (sin tapa)" },
              { label: "Metales", examples: "Latas de aluminio, tapas metálicas, envases de aerosol vacíos" },
              { label: "Electrónicos", examples: "Celulares, computadores, pilas, cables (en puntos limpios)" },
              { label: "Textiles", examples: "Ropa, zapatos, sábanas (en contenedores especiales)" }
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                <h3 className="font-display font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.examples}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">
            Consejos para reciclar mejor
          </h2>
          <div className="space-y-3">
            {tips.map((tip) => (
              <div key={tip.title} className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="shrink-0 p-2 rounded-lg bg-primary/10 h-fit">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Errores comunes */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Errores comunes que debes evitar
            </h2>
          </div>
          <ul className="space-y-2">
            {mistakes.map((mistake, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 text-destructive text-xs font-bold">
                  {i + 1}
                </span>
                {mistake}
              </li>
            ))}
          </ul>
        </section>

        {/* Beneficios */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Beneficios del reciclaje
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "Menos contaminación", desc: "Reduce la basura en vertederos y la contaminación de suelos y océanos." },
              { title: "Ahorro energético", desc: "Reciclar aluminio ahorra hasta un 95% de energía respecto a producirlo nuevo." },
              { title: "Empleo verde", desc: "La industria del reciclaje genera miles de puestos de trabajo." }
            ].map((b) => (
              <div key={b.title} className="p-4 rounded-xl bg-secondary/50 border border-border text-center space-y-2">
                <h3 className="font-display font-semibold text-foreground text-sm">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-6">
          <p className="text-muted-foreground text-sm mb-3">
            ¿Listo para empezar? Encuentra tu punto de reciclaje más cercano.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Recycle className="w-4 h-4" />
            Buscar puntos de reciclaje
          </Link>
        </section>

        <footer className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Recycle className="w-4 h-4 text-primary" />
            <span className="text-sm font-display font-semibold">GeoRecicla</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Reciclar nunca fue tan fácil</p>
        </footer>
      </main>
    </div>
  );
};

export default Blog;
