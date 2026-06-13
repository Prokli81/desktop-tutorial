# Камера телефона — пошагово

Chrome на Android **не открывает камеру** по `http://192.168...`.  
Нужна ссылка **`https://...`**. Проще всего — **Cloudflare Tunnel** (бесплатно, без своего домена).

---

## Шаг 1. Сервер Sklad на ПК

Окно PowerShell **№1** (не закрывать):

```powershell
cd C:\Users\Grimm\sklad
python -m http.server 4174
```

---

## Шаг 2. Скачать cloudflared (один раз)

1. Откройте: https://github.com/cloudflare/cloudflared/releases  
2. Скачайте **cloudflared-windows-amd64.exe**  
3. Переименуйте в **`cloudflared.exe`**  
4. Положите в `C:\Users\Grimm\sklad\`

---

## Шаг 3. HTTPS-туннель

Окно PowerShell **№2**:

```powershell
cd C:\Users\Grimm\sklad
.\cloudflared.exe tunnel --url http://127.0.0.1:4174
```

Появится строка вида:

```
https://something-random.trycloudflare.com
```

**Скопируйте эту https-ссылку.** Окно не закрывайте.

---

## Шаг 4. На телефоне (Android)

1. Chrome → вставьте **https://...trycloudflare.com**  
2. **Телефон (склад)**  
3. Разрешите **доступ к камере**, если спросит  
4. Наведите на штрихкод / QR или введите код вручную  

На ПК по-прежнему: **http://localhost:4174** → **ПК (офис)** → подтверждение накладных.

> Телефон и ПК могут быть в **разных сетях** — туннель идёт через интернет. Для работы нужен интернет на обоих.

---

## Автозапуск (два окна)

Двойной щелчок **`start-s-kameroy.bat`** в папке `sklad` (если `cloudflared.exe` лежит рядом).

---

## Если камера всё равно не открывается

- Chrome → **Настройки сайта** → **Камера** → разрешить для этого адреса  
- Закройте вкладку и откройте https-ссылку снова  
- Попробуйте ввести код вручную — логика та же  

---

## Альтернатива: ngrok

1. https://ngrok.com/download — регистрация и authtoken  
2. `ngrok http 4174`  
3. На телефоне открыть выданный **https://** адрес  
