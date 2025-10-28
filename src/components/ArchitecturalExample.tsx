'use client';

interface ArchitecturalExampleSection {
  id?: number;
  title?: string;
  article?: string;
}

interface ArchitecturalExampleProps {
  sections: ArchitecturalExampleSection[];
}

export default function ArchitecturalExample({ sections }: ArchitecturalExampleProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, index) => (
        <div key={section.id || index} className="flex flex-col gap-6 ">
          {section.title && (
            <h2 className="mt-16 font-['Kanit'] font-medium text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
              {section.title}
            </h2>
          )}
          
          {section.article && (
            <div className="bg-[#ECEFF2] p-6 rounded-3xl overflow-hidden">
              <div 
                className="architectural-example-content font-['Kanit']"
                dangerouslySetInnerHTML={{ __html: section.article }}
              />
            </div>
          )}
        </div>
      ))}
      
      <style jsx global>{`
        .architectural-example-content h4 {
          font-size: 1.375rem;
          font-weight: 500;
          color: var(--color-primary);
        }
        
        .architectural-example-content h1,
        .architectural-example-content h2,
        .architectural-example-content h3,
        .architectural-example-content h5,
        .architectural-example-content h6 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-primary);
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .architectural-example-content p {
          line-height: 1.75;
          margin-bottom: 1rem;
          font-size: 1.375rem;
          color: var(--color-foreground);
          font-weight: 400;
        }
        
        .architectural-example-content img {
          width: 100%;
          height: auto;
          border-radius: 1.5rem;
        }
        
        .architectural-example-content ul,
        .architectural-example-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .architectural-example-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }
        
        .architectural-example-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        .architectural-example-content table th,
        .architectural-example-content table td {
          border: 1px solid #E5E5E5;
          padding: 0.75rem;
          text-align: left;
        }
        
        .architectural-example-content table th {
          background-color: #1063A7;
          color: white;
          font-weight: 600;
        }
        
        .architectural-example-content table tr:nth-child(even) {
          background-color: #F5F5F5;
        }
        
        .architectural-example-content strong {
          color: #1063A7;
          font-weight: 600;
        }
        
        .architectural-example-content a {
          color: #1063A7;
          text-decoration: underline;
        }
        
        .architectural-example-content a:hover {
          color: #E92928;
        }
        
        .architectural-example-content blockquote {
          border-left: 4px solid #1063A7;
          padding-left: 1rem;
          margin: 1.5rem 0;
          background-color: #F5F5F5;
          padding: 1rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
