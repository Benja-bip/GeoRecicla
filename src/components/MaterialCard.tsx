import { motion } from "framer-motion";
import plasticBottle from "@/assets/plastic-bottle.png";

interface MaterialCardProps {
  onOpen: () => void;
}

const MaterialCard = ({ onOpen }: MaterialCardProps) => {
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card rounded-2xl border border-border shadow-eco overflow-hidden text-left w-full max-w-xs"
    >
      <div className="p-4 flex flex-col items-center gap-3">
        <div className="w-24 h-32 flex items-center justify-center">
          <img src={plasticBottle} alt="Botella plástica PET" className="h-full object-contain" />
        </div>
        <div className="text-center">
          <h3 className="font-display font-bold text-foreground">Botella PET</h3>
          <p className="text-sm text-muted-foreground">Plástico reciclable #1</p>
        </div>
      </div>
    </motion.button>
  );
};

export default MaterialCard;
