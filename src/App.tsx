import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { User, Mail, ArrowRight, Phone, Calendar, Users, DollarSign } from 'lucide-react';
import type { FunnelData, Rates, MarketRates } from './types';

// Import the logo image
import logo from '../assets/logo.png'; // Adjust the path as needed

const marketRates: MarketRates = {
  leadsToAppointments: 5.1,
  appointmentsToAttendance: 22.4,
  attendanceToSales: 36.3,
  leadsToSales: 4.2
};

function App() {
  const [step, setStep] = useState(1); // Main step (1 for form, 2 for results)
  const [formStep, setFormStep] = useState(1); // Sub-step for form questions
  const [rates, setRates] = useState<Rates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FunnelData>();

  // Pre-calculate funnel widths to avoid delays
  const funnelWidths = {
    leads: 100,
    appointments: rates ? (getValues('appointments') / getValues('leads')) * 100 : 0,
    attendance: rates ? (getValues('attendance') / getValues('leads')) * 100 : 0,
    sales: rates ? (getValues('sales') / getValues('leads')) * 100 : 0
  };

  // Loading messages
  const loadingMessages = [
    'Analisando os dados do seu negócio...',
    'Preparando sua análise de dados...'
  ];

  // Cycle through loading messages every 2 seconds
  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  const calculateRates = (data: FunnelData): Rates => {
    return {
      leadsToAppointments: (data.appointments / data.leads) * 100,
      appointmentsToAttendance: (data.attendance / data.appointments) * 100,
      attendanceToSales: (data.sales / data.attendance) * 100,
      leadsToSales: (data.sales / data.leads) * 100
    };
  };

  const onSubmit = async (data: FunnelData) => {
    setIsSubmitting(true);
    try {
      const calculatedRates = calculateRates(data);
      setRates(calculatedRates);

      const response = await axios.post(
        'https://back-end-funil-monaco.vercel.app/api/submit-form',
        {
          ...data,
          rates: calculatedRates,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to submit form');
      }

      setStep(2);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRateLabel = (key: keyof Rates): string => {
    switch (key) {
      case 'leadsToAppointments':
        return 'A taxa média do seu segmento de Leads para Oportunidades é';
      case 'appointmentsToAttendance':
        return 'A taxa média do seu segmento de Oportunidades para Comparecimentos é';
      case 'attendanceToSales':
        return 'A taxa média do seu segmento de Comparecimentos para Vendas é';
      case 'leadsToSales':
        return 'A taxa média do seu segmento de Leads para Vendas é';
      default:
        return '';
    }
  };

  // Handle moving to the next form step
  const handleNext = async () => {
    // Mapeia os campos que devem ser validados em cada passo
    const fieldsToValidate = {
      1: ['name'],
      2: ['email'],
      3: ['phone'],
      4: ['leads'],
      5: ['appointments'],
      6: ['attendance'],
      7: ['sales']
    };
  
    // Obtém os campos a serem validados para o passo atual
    const fields = fieldsToValidate[formStep as keyof typeof fieldsToValidate];
    
    // Valida todos os campos necessários para o passo atual
    const isValid = await trigger(fields);
  
    if (isValid) {
      if (formStep < 7) {
        setFormStep(formStep + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };
  // Handle moving to the previous form step
  const handlePrevious = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  // Input field animation variants
  const inputVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5, ease: 'easeIn' } }
  };

  // Simplified funnel bar animation variants
  const funnelBarVariants = {
    hidden: { width: 0 },
    visible: (custom: number) => ({
      width: `${custom}%`,
      transition: { duration: 0.5, ease: 'easeOut' }
    })
  };

  // Loading message animation variants
  const loadingMessageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-400">
      {/* Navbar */}
      <nav className="bg-[oklch(0.424_0.199_265.638)] p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-full md:max-w-7xl bg-white rounded-2xl shadow-xl p-4 md:p-12 min-h-[400px] md:min-h-[600px]"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            Análise de Funil Odontológico
          </h1>

          {/* Loading Animation */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px]"
              >
                {/* Spinner */}
                <motion.div
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                {/* Loading Messages */}
                <div className="mt-6 text-base md:text-lg text-gray-600">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMessageIndex}
                      variants={loadingMessageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {loadingMessages[loadingMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form or Results */}
          {!isSubmitting && step === 1 && (
            <div className="flex flex-col justify-between h-full">
              {/* Empty Space at the Top */}
              <div className="flex-1"></div>

              {/* Input Fields at the Bottom */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-20">
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div
                      key="name"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className=''
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <User className="w-5 h-5 mr-2 text-gray-700" />
                        Qual o seu nome?
                      </label>
                      <input
                        {...register("name", { required: "Nome é obrigatório" })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="Seu nome"
                      />
                      {errors.name && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.name.message}</span>
                      )}
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div
                      key="email"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <Mail className="w-5 h-5 mr-2 text-gray-700" />
                        E-mail
                      </label>
                      <input
                        {...register("email", { 
                          required: "E-mail é obrigatório",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "E-mail inválido"
                          }
                        })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="seu@email.com"
                      />
                      {errors.email && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>
                      )}
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div
                      key="phone"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <Phone className="w-5 h-5 mr-2 text-gray-700" />
                        Telefone
                      </label>
                      <input
                        {...register("phone", { 
                          required: "Telefone é obrigatório",
                          pattern: {
                            value: /^\+?[1-9]\d{1,14}$/,
                            message: "Telefone inválido (use apenas números, opcionalmente com código de país)"
                          }
                        })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="+5511999999999"
                      />
                      {errors.phone && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.phone.message}</span>
                      )}
                    </motion.div>
                  )}

                  {formStep === 4 && (
                    <motion.div
                      key="leads"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <Phone className="w-5 h-5 mr-2 text-gray-700" />
                        Leads Recebidos
                      </label>
                      <input
                        type="number"
                        {...register("leads", { required: "Este campo é obrigatório", min: 0 })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="0"
                      />
                      {errors.leads && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.leads.message}</span>
                      )}
                    </motion.div>
                  )}

                  {formStep === 5 && (
                    <motion.div
                      key="appointments"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <Calendar className="w-5 h-5 mr-2 text-gray-700" />
                        Agendamentos
                      </label>
                      <input
                        type="number"
                        {...register("appointments", { required: "Este campo é obrigatório", min: 0 })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="0"
                      />
                      {errors.appointments && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.appointments.message}</span>
                      )}
                    </motion.div>
                  )}

                  {formStep === 6 && (
                    <motion.div
                      key="attendance"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <Users className="w-5 h-5 mr-2 text-gray-700" />
                        Comparecimentos
                      </label>
                      <input
                        type="number"
                        {...register("attendance", { required: "Este campo é obrigatório", min: 0 })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="0"
                      />
                      {errors.attendance && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.attendance.message}</span>
                      )}
                    </motion.div>
                  )}

                  {formStep === 7 && (
                    <motion.div
                      key="sales"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="flex items-center text-gray-700 mb-2 text-sm md:text-base">
                        <DollarSign className="w-5 h-5 mr-2 text-gray-700" />
                        Vendas Realizadas
                      </label>
                      <input
                        type="number"
                        {...register("sales", { required: "Este campo é obrigatório", min: 0 })}
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 shadow-sm transition-all duration-300 hover:shadow-md text-sm md:text-base"
                        placeholder="0"
                      />
                      {errors.sales && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.sales.message}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Navigation Buttons */}
              <div className="mt-6">
                <div className="flex justify-between">
                  {formStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors text-sm md:text-base"
                    >
                      <span>Voltar</span>
                    </motion.button>
                  )}
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-70 hover:bg-blue-700 transition-colors ml-auto text-sm md:text-base"
                  >
                    <span>{isSubmitting ? 'Enviando...' : formStep === 7 ? 'Analisar Resultados' : 'Próximo'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {!isSubmitting && step === 2 && rates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Funnel Visualization */}
              <div className="space-y-6">
                {/* Leads */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-40 text-gray-700 font-semibold">Leads</div>
                  <div className="flex-1 flex items-center">
                    <motion.div
                      className="h-12 bg-cyan-400 rounded-l-lg"
                      variants={funnelBarVariants}
                      initial="hidden"
                      animate="visible"
                      custom={funnelWidths.leads}
                      style={{ minWidth: '200px' }}
                    >
                      <div className="h-full flex items-center justify-end pr-4 text-white font-bold">
                        {getValues('leads')}
                      </div>
                    </motion.div>
                    <div className="w-8 h-12 bg-gray-300 rounded-r-lg" />
                  </div>
                  <div className="w-full md:w-24 text-center text-gray-600">{rates.leadsToAppointments.toFixed(1)}%</div>
                  <div className="w-full md:w-64 bg-cyan-100 p-4 rounded-lg shadow-md">
                    <p className="text-gray-700 font-medium">
                      {getRateLabel('leadsToAppointments')} {marketRates.leadsToAppointments}%.
                    </p>
                    <p className={`mt-2 font-semibold ${rates.leadsToAppointments >= marketRates.leadsToAppointments ? 'text-green-600' : 'text-red-600'}`}>
                      {rates.leadsToAppointments >= marketRates.leadsToAppointments
                        ? 'Ótimo trabalho!'
                        : 'Com certeza ainda tem espaço para melhorias!'}
                    </p>
                  </div>
                </div>

                {/* Oportunidades (Appointments) */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-40 text-gray-700 font-semibold">Oportunidades</div>
                  <div className="flex-1 flex items-center">
                    <motion.div
                      className="h-12 bg-cyan-400 rounded-l-lg"
                      variants={funnelBarVariants}
                      initial="hidden"
                      animate="visible"
                      custom={funnelWidths.appointments}
                      style={{ minWidth: '200px' }}
                    >
                      <div className="h-full flex items-center justify-end pr-4 text-white font-bold">
                        {getValues('appointments')}
                      </div>
                    </motion.div>
                    <div className="w-8 h-12 bg-gray-300 rounded-r-lg" />
                  </div>
                  <div className="w-full md:w-24 text-center text-gray-600">{rates.appointmentsToAttendance.toFixed(1)}%</div>
                  <div className="w-full md:w-64 bg-cyan-100 p-4 rounded-lg shadow-md">
                    <p className="text-gray-700 font-medium">
                      {getRateLabel('appointmentsToAttendance')} {marketRates.appointmentsToAttendance}%.
                    </p>
                    <p className={`mt-2 font-semibold ${rates.appointmentsToAttendance >= marketRates.appointmentsToAttendance ? 'text-green-600' : 'text-red-600'}`}>
                      {rates.appointmentsToAttendance >= marketRates.appointmentsToAttendance
                        ? 'Ótimo trabalho!'
                        : 'Com certeza ainda tem espaço para melhorias!'}
                    </p>
                  </div>
                </div>

                {/* Comparecimentos (Attendance) */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-40 text-gray-700 font-semibold">Comparecimentos</div>
                  <div className="flex-1 flex items-center">
                    <motion.div
                      className="h-12 bg-cyan-400 rounded-l-lg"
                      variants={funnelBarVariants}
                      initial="hidden"
                      animate="visible"
                      custom={funnelWidths.attendance}
                      style={{ minWidth: '200px' }}
                    >
                      <div className="h-full flex items-center justify-end pr-4 text-white font-bold">
                        {getValues('attendance')}
                      </div>
                    </motion.div>
                    <div className="w-8 h-12 bg-gray-300 rounded-r-lg" />
                  </div>
                  <div className="w-full md:w-24 text-center text-gray-600">{rates.attendanceToSales.toFixed(1)}%</div>
                  <div className="w-full md:w-64 bg-cyan-100 p-4 rounded-lg shadow-md">
                    <p className="text-gray-700 font-medium">
                      {getRateLabel('attendanceToSales')} {marketRates.attendanceToSales}%.
                    </p>
                    <p className={`mt-2 font-semibold ${rates.attendanceToSales >= marketRates.attendanceToSales ? 'text-green-600' : 'text-red-600'}`}>
                      {rates.attendanceToSales >= marketRates.attendanceToSales
                        ? 'Ótimo trabalho!'
                        : 'Com certeza ainda tem espaço para melhorias!'}
                    </p>
                  </div>
                </div>

                {/* Vendas (Sales) */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-40 text-gray-700 font-semibold">Vendas</div>
                  <div className="flex-1 flex items-center">
                    <motion.div
                      className="h-12 bg-red-500 rounded-l-lg"
                      variants={funnelBarVariants}
                      initial="hidden"
                      animate="visible"
                      custom={funnelWidths.sales}
                      style={{ minWidth: '200px' }}
                    >
                      <div className="h-full flex items-center justify-end pr-4 text-white font-bold">
                        {getValues('sales')}
                      </div>
                    </motion.div>
                    <div className="w-8 h-12 bg-gray-300 rounded-r-lg" />
                  </div>
                  <div className="w-full md:w-24 text-center text-gray-600">{rates.leadsToSales.toFixed(1)}%</div>
                  <div className="w-full md:w-64 bg-cyan-100 p-4 rounded-lg shadow-md">
                    <p className="text-gray-700 font-medium">
                      {getRateLabel('leadsToSales')} {marketRates.leadsToSales}%.
                    </p>
                    <p className={`mt-2 font-semibold ${rates.leadsToSales >= marketRates.leadsToSales ? 'text-green-600' : 'text-red-600'}`}>
                      {rates.leadsToSales >= marketRates.leadsToSales
                        ? 'Ótimo trabalho!'
                        : 'Com certeza ainda tem espaço para melhorias!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <motion.a
                href={`https://wa.me/+554598407452?text=${encodeURIComponent(
                  `Olá! Analisei meu funil e gostaria de melhorar meus resultados. Minhas taxas são:\n` +
                  `Leads para Oportunidades: ${rates.leadsToAppointments.toFixed(1)}%\n` +
                  `Oportunidades para Comparecimentos: ${rates.appointmentsToAttendance.toFixed(1)}%\n` +
                  `Comparecimentos para Vendas: ${rates.attendanceToSales.toFixed(1)}%\n` +
                  `Leads para Vendas: ${rates.leadsToSales.toFixed(1)}%`
                )}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center mt-6 hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                Quero ajuda para melhorar meu funil
              </motion.a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default App;