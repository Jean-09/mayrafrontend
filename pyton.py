import requests
import json

# URL del endpoint
url = "http://localhost:1338/api/servicios"

# Token de autenticación
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MjI3ODM1LCJleHAiOjE3NTc4MTk4MzV9.oddTUy_w9pYDZEoc53UW1cl8TQauuC6WxOP7zO8qDCA" # Reemplaza con tu token

# Headers para la petición
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Lista de datos para los servicios adicionales
# NOTA: Si un servicio tiene una relación, reemplaza 'documento-id-pedido-ejemplo'
# con un documentId real de un pedido de tu base de datos.
servicios_adicionales_data = [
    {
        "nombre": "Servicio de planchado",
        "descripcion": "Planchado profesional de prendas, por pieza.",
        "precio_adicional": 20.00,
        "activo": True
    },
    {
        "nombre": "Servicio de teñido",
        "descripcion": "Cambio de color de prendas seleccionadas.",
        "precio_adicional": 150.00,
        "activo": True
    },
    {
        "nombre": "Arreglo de costura",
        "descripcion": "Pequeños arreglos y ajustes de costura.",
        "precio_adicional": 50.00,
        "activo": True
    },
    {
        "nombre": "Lavado de edredones",
        "descripcion": "Limpieza especial para edredones, cobijas y cobertores.",
        "precio_adicional": 85.00,
        "activo": True
    },
    {
        "nombre": "Limpieza de alfombras",
        "descripcion": "Lavado de alfombras de tamaño pequeño a mediano.",
        "precio_adicional": 200.00,
        "activo": False
    },
    {
        "nombre": "Lavado de cortinas",
        "descripcion": "Lavado y secado de cortinas, por pieza.",
        "precio_adicional": 75.00,
        "activo": True
    },
    {
        "nombre": "Servicio de desmanchado",
        "descripcion": "Tratamiento especializado para remover manchas difíciles.",
        "precio_adicional": 40.00,
        "activo": True
    },
    {
        "nombre": "Lavado de calzado",
        "descripcion": "Limpieza profesional de tenis y zapatos.",
        "precio_adicional": 65.00,
        "activo": False
    },
    {
        "nombre": "Limpieza de cojines",
        "descripcion": "Limpieza profunda de cojines y almohadas.",
        "precio_adicional": 30.00,
        "activo": True
    },
    {
        "nombre": "Servicio a domicilio",
        "descripcion": "Recolección y entrega de ropa en la dirección del cliente.",
        "precio_adicional": 25.00,
        "activo": True
    },
    {
        "nombre": "Doblado especial",
        "descripcion": "Doblado y empaquetado de prendas con cuidado extra.",
        "precio_adicional": 15.00,
        "activo": True
    }
]

# Enviar cada servicio de la lista a la API
for servicio in servicios_adicionales_data:
    data_payload = {
        "data": servicio
    }
    response = requests.post(url, json=data_payload, headers=headers)
    
    # Imprimir el resultado de cada petición
    print(f"Enviando: {servicio['nombre']} -> Estado: {response.status_code}, Respuesta: {response.text}")
# import requests
# import datetime
# import json

# # URL del endpoint
# url = "http://localhost:1338/api/pedidos"

# # Token de autenticación
# token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MjI3ODM1LCJleHAiOjE3NTc4MTk4MzV9.oddTUy_w9pYDZEoc53UW1cl8TQauuC6WxOP7zO8qDCA"

# # Headers para la petición
# headers = {
#     "Authorization": f"Bearer {token}",
#     "Content-Type": "application/json"
# }

# # Datos para los pedidos con los documentId que solicitaste
# pedidos_data = [
#     {
#         "nombre": '1',
#         "sucursal": "sbco0ktcwa1a24fc4yc0vxdb",
#         "users_permissions_user": "xwp81ev2h0b0mb6asj6my9jj",
#         "prenda": [],
#         "estado": "Pendiente",
#         "total": 125.50,
#         "observaciones": "Pedido inicial del cliente. Recoger en sucursal.",
#         "cliente_nombre": "Carlos López",
#         "cliente_telefono": "5512345678",
#     },
#     {
#         "numero_pedido": '2',
#         "sucursal": "sbco0ktcwa1a24fc4yc0vxdb",
#         "users_permissions_user": "xwp81ev2h0b0mb6asj6my9jj",
#         "prenda": [],
#         "estado": "En proceso",
#         "total": 89.00,
#         "observaciones": "Solicita limpieza en seco para 3 camisas.",
#         "cliente_nombre": "Ana García",
#         "cliente_telefono": "5587654321",
#     },
#     {
#         "numero_pedido": '3',
#         "sucursal": "sbco0ktcwa1a24fc4yc0vxdb",
#         "users_permissions_user": "xwp81ev2h0b0mb6asj6my9jj",
#         "prenda": [],
#         "estado": "Entregado",
#         "total": 210.75,
#         "observaciones": "Pago en efectivo al momento de la entrega.",
#         "cliente_nombre": "Luis Pérez",
#         "cliente_telefono": "5555555555",
#     }
# ]

# # Enviar cada pedido a la API
# for pedido in pedidos_data:
#     data = {"data": pedido}
#     response = requests.post(url, json=data, headers=headers)
#     print(f"Pedido {pedido['numero_pedido']} -> Estado: {response.status_code}, Respuesta: {response.text}")
# import requests
# import json

# # URL del endpoint
# url = "http://localhost:1338/api/categorias-prendas"

# # Token Bearer
# token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MjI3ODM1LCJleHAiOjE3NTc4MTk4MzV9.oddTUy_w9pYDZEoc53UW1cl8TQauuC6WxOP7zO8qDCA"

# # Datos a enviar (lista de diccionarios)
# categorias_prendas = [
#   {
#     "nombre": "Camisa",
#     "descripcion": "Camisa de manga larga o corta, de tela ligera como algodón o poliéster.",
#     "precio_base": 30.00
#   },
#   {
#     "nombre": "Pantalón de mezclilla",
#     "descripcion": "Pantalón de tela de mezclilla (jeans), resistente y gruesa.",
#     "precio_base": 45.00
#   },
#   {
#     "nombre": "Sudadera",
#     "descripcion": "Prenda de algodón o poliéster, con o sin capucha.",
#     "precio_base": 40.00
#   },
#   {
#     "nombre": "Vestido",
#     "descripcion": "Vestido casual, de tela común (no de gala).",
#     "precio_base": 55.00
#   },
#   {
#     "nombre": "Falda",
#     "descripcion": "Falda de algodón o poliéster, de largo variado.",
#     "precio_base": 35.00
#   },
#   {
#     "nombre": "Chamarra ligera",
#     "descripcion": "Chamarra de tela fina, sin relleno grueso.",
#     "precio_base": 60.00
#   },
#   {
#     "nombre": "Polo",
#     "descripcion": "Camiseta con cuello y botones, de algodón o piqué.",
#     "precio_base": 30.00
#   },
#   {
#     "nombre": "Blusa",
#     "descripcion": "Prenda superior de mujer, de tela ligera y delicada.",
#     "precio_base": 35.00
#   },
#   {
#     "nombre": "Shorts",
#     "descripcion": "Pantalón corto de tela de mezclilla o algodón.",
#     "precio_base": 25.00
#   },
#   {
#     "nombre": "Playera",
#     "descripcion": "Camiseta de algodón, sin cuello ni botones.",
#     "precio_base": 20.00
#   },
#   {
#     "nombre": "Sábana (individual)",
#     "descripcion": "Juego de sábanas para cama individual, incluye sábana bajera y superior.",
#     "precio_base": 70.00
#   },
#   {
#     "nombre": "Toalla (grande)",
#     "descripcion": "Toalla de baño de algodón, de tamaño estándar.",
#     "precio_base": 40.00
#   },
#   {
#     "nombre": "Cortina",
#     "descripcion": "Cortina de tela ligera para ventana, por pieza.",
#     "precio_base": 80.00
#   },
#   {
#     "nombre": "Edredón (individual)",
#     "descripcion": "Edredón para cama individual, con relleno de fibra sintética.",
#     "precio_base": 120.00
#   },
#   {
#     "nombre": "Cojín",
#     "descripcion": "Funda o pieza de cojín, de tela de algodón o sintética.",
#     "precio_base": 25.00
#   }
# ]

# # Headers para la petición
# headers = {
#     "Authorization": f"Bearer {token}",
#     "Content-Type": "application/json"
# }

# # 1. Itera sobre cada objeto en la lista
# for prenda in categorias_prendas:
#     # 2. Crea el payload de datos para UNA SOLA prenda
#     data_payload = {
#         "data": prenda
#     }
    
#     # 3. Envía una petición POST para esa prenda
#     response = requests.post(url, json=data_payload, headers=headers)
    
#     # 4. Imprime el resultado para saber si funcionó
#     print(f"Enviando: {prenda['nombre']} -> {response.status_code} {response.text}")