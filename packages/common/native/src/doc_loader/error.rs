use super::*;
use std::{io, string::FromUtf8Error};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum LoaderError {
  #[error("{0}")]
  TextSplitter(#[from] TextSplitterError),

  #[error(transparent)]
  IO(#[from] io::Error),

  #[error(transparent)]
  FromUtf8(#[from] FromUtf8Error),

  #[error(transparent)]
  PdfExtract(#[from] pdf_extract::Error),

  #[error(transparent)]
  PdfExtractOutput(#[from] pdf_extract::OutputError),

  #[error(transparent)]
  Readability(#[from] readability::error::Error),

  #[error(transparent)]
  UrlParse(#[from] url::ParseError),

  #[error("Error: {0}")]
  Other(String),
}

pub type LoaderResult<T> = Result<T, LoaderError>;
