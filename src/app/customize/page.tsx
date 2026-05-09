'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const CATEGORIES = [
  { id: 'product', label: 'Customize a Product' },
  { id: 'bouquet', label: 'Custom Bouquet' },
  { id: 'hamper', label: 'Personalized Hamper' },
  { id: 'event', label: 'Event Setup' },
  { id: 'other', label: 'Other Idea' }
];

const PREDEFINED_OPTIONS: Record<string, { label: string; name: string; options: string[] }[]> = {
  bouquet: [
    { label: 'Style', name: 'style', options: ['Modern', 'Classic', 'Minimalist', 'Wildflower'] },
    { label: 'Color Palette', name: 'color', options: ['Romantic Reds', 'Pastel Pinks', 'Bright & Sunny', 'Elegant Whites'] }
  ],
  hamper: [
    { label: 'Occasion', name: 'occasion', options: ['Birthday', 'Anniversary', 'Corporate', 'Just Because'] },
    { label: 'Recipient', name: 'recipient', options: ['Him', 'Her', 'Couple', 'Colleague'] },
    { label: 'Primary Item', name: 'primaryItem', options: ['Chocolates', 'Skincare', 'Stationery', 'Mix'] }
  ],
  event: [
    { label: 'Event Type', name: 'eventType', options: ['Wedding', 'Birthday Party', 'Corporate Event', 'Intimate Gathering'] },
    { label: 'Guest Count', name: 'guests', options: ['Under 20', '20-50', '50-100', '100+'] }
  ],
  product: [
    { label: 'Customization Type', name: 'customizationType', options: ['Color Change', 'Size Adjustment', 'Add Component', 'Other'] }
  ],
  other: []
};

export default function CustomizePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState<Record<string, string>>({});
  const [customInput, setCustomInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);

  // Check auth & fetch products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStoreProducts(data);
        }
      })
      .catch(err => console.error(err));
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          router.push('/login?redirect=/customize');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleOptionChange = (name: string, value: string) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, options, customInput, image })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setSubmittedId(data.customization.id);
      } else {
        alert(data.error || 'Failed to submit customization');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isSuccess) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <h1>Customization Received!</h1>
          <p>Thank you for sharing your ideas. Our team will review your request and get back to you shortly.</p>
          

          <button onClick={() => router.push('/')} className={styles.btnNext} style={{ marginTop: '2rem' }}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const isStepValid = () => {
    if (step === 1) return category !== '';
    if (step === 2) {
      if (category === 'product' && !options['selectedProduct']) return false;
      const currentQuestions = PREDEFINED_OPTIONS[category] || [];
      return currentQuestions.every(q => options[q.name]);
    }
    return true; // Step 3 is optional, Step 4 is review
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Bring Your Ideas to Life</h1>
        <p>Let's design something special just for you.</p>
      </div>

      <div className={styles.stepper}>
        {[1, 2, 3, 4].map(num => (
          <div key={num} className={`${styles.stepIndicator} ${step >= num ? styles.active : ''} ${step > num ? styles.completed : ''}`}>
            {step > num ? '✓' : num}
          </div>
        ))}
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h2>What are you looking for?</h2>
          <div className={styles.cardGrid}>
            {CATEGORIES.map(cat => (
              <div 
                key={cat.id}
                className={`${styles.optionCard} ${category === cat.id ? styles.selected : ''}`}
                onClick={() => { setCategory(cat.id); setOptions({}); }}
              >
                <h3>{cat.label}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Dynamic Options */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h2>Let's narrow down the details</h2>

          {category === 'product' && (
            <div className={styles.dynamicSection} style={{ marginBottom: '1rem' }}>
              <div className={styles.questionGroup}>
                <label>Select Product to Customize</label>
                <select 
                  className={styles.selectInput}
                  value={options['selectedProduct'] || ''}
                  onChange={e => handleOptionChange('selectedProduct', e.target.value)}
                >
                  <option value="" disabled>Select a product</option>
                  {storeProducts.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {PREDEFINED_OPTIONS[category]?.length > 0 ? (
            <div className={styles.dynamicSection}>
              {PREDEFINED_OPTIONS[category].map(q => (
                <div key={q.name} className={styles.questionGroup}>
                  <label>{q.label}</label>
                  <select 
                    className={styles.selectInput}
                    value={options[q.name] || ''}
                    onChange={e => handleOptionChange(q.name, e.target.value)}
                  >
                    <option value="" disabled>Select {q.label}</option>
                    {q.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No predefined options for this category. Click next to describe your idea!
            </p>
          )}
        </div>
      )}

      {/* Step 3: Custom Input */}
      {step === 3 && (
        <div className={styles.stepContent}>
          <h2>Add your personal touch</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>Describe exactly what you have in mind (Optional)</p>
          <textarea
            className={styles.textArea}
            placeholder="Example: I want a birthday gift with name and photo printed in a specific pink theme..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
          />

          <div className={styles.uploadSection}>
            <label className={styles.uploadLabel}>Add Inspiration Photos (Optional)</label>
            <div className={styles.uploadContainer}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {!image ? (
                <button 
                  type="button" 
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className={styles.uploadIcon}>📷</span>
                  <span>Upload from Gallery</span>
                </button>
              ) : (
                <div className={styles.previewContainer}>
                  <img src={image} alt="Preview" className={styles.imagePreview} />
                  <button type="button" className={styles.removeImageBtn} onClick={removeImage}>
                    ✕
                  </button>
                </div>
              )}
            </div>
            <p className={styles.uploadHint}>Max size: 5MB. Supports JPG, PNG.</p>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className={styles.stepContent}>
          <h2>Review your request</h2>
          <div className={styles.reviewSection}>
            <div className={styles.reviewItem}>
              <span>Category</span>
              <span>{CATEGORIES.find(c => c.id === category)?.label}</span>
            </div>
            
            {Object.entries(options).map(([key, value]) => {
              const question = PREDEFINED_OPTIONS[category]?.find(q => q.name === key);
              return (
                <div key={key} className={styles.reviewItem}>
                  <span>{question?.label || key}</span>
                  <span>{value}</span>
                </div>
              );
            })}

            {customInput && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ display: 'block', fontWeight: 600, color: '#555', marginBottom: '0.5rem' }}>Your Custom Idea</span>
                <p style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontStyle: 'italic' }}>
                  "{customInput}"
                </p>
              </div>
            )}

            {image && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ display: 'block', fontWeight: 600, color: '#555', marginBottom: '0.5rem' }}>Attached Photo</span>
                <div className={styles.reviewImageContainer}>
                  <img src={image} alt="Customization" className={styles.reviewImage} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={styles.buttonGroup}>
        {step > 1 ? (
          <button onClick={handleBack} className={styles.btnBack}>Back</button>
        ) : <div />}
        
        {step < 4 ? (
          <button onClick={handleNext} className={styles.btnNext} disabled={!isStepValid()}>
            Next Step
          </button>
        ) : (
          <button onClick={handleSubmit} className={styles.btnNext} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        )}
      </div>
    </div>
  );
}
