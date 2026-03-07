import { useState } from "react";

export default function ProductVariants({ variants }) {

  const [size,setSize] = useState(null)
  const [color,setColor] = useState(null)

  return (

    <div className="space-y-4 mt-6">

      {/* SIZE */}
      <div>

        <h4 className="font-semibold mb-2">Size</h4>

        <div className="flex gap-2">
          {variants.sizes.map((s)=>(
            <button
              key={s}
              onClick={()=>setSize(s)}
              className={`border px-3 py-1 rounded
              ${size===s ? "border-orange-500":"border-gray-300"}`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>


      {/* COLOR */}
      <div>

        <h4 className="font-semibold mb-2">Color</h4>

        <div className="flex gap-2">

          {variants.colors.map((c)=>(
            <div
              key={c}
              onClick={()=>setColor(c)}
              style={{background:c}}
              className={`w-8 h-8 rounded-full cursor-pointer border-2
              ${color===c ? "border-orange-500":"border-gray-200"}`}
            />
          ))}

        </div>

      </div>

    </div>
  )
}