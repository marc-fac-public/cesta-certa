export type PapelUsuario = 'administrador' | 'voluntario';

/** Usuário do sistema. A senha fica no Firebase Authentication e nunca neste modelo. */
export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
}
