{ pkgs, ... }: {
  # Canal de paquetes de nix
  channel = "stable-23.11";

  # Paquetes que necesitas (Node.js para correr Vite)
  packages = [
    pkgs.nodejs_20
  ];

  # Variables de entorno
  env = {};

  # Configuración de IDX
  idx = {
    # Extensiones que quieres en el editor
    extensions = [
      "vscodevim.vim"
    ];

    # Configuración de la Vista Previa (Preview)
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}